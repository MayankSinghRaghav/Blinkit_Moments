/**
 * Golden-set harness. Offline by default (deterministic matcher, no quota).
 *   npm run eval
 *   npm run eval:live   # hits a running dev server, exercises the LLM path
 */
import golden from "./occasion-golden.json";
import { completeOccasion, type CompleteResult } from "@/lib/scoring";
import { isHighConsideration } from "@/lib/data/catalog";

const live = process.argv.includes("--live");
const BASE = process.env.EVAL_BASE_URL ?? "http://localhost:3000";

type Case = (typeof golden)[number] & {
  expect_new_categories_any_of?: string[];
  must_include_confidence_note?: boolean;
};

// Gemini's free tier is ~10 req/min and the app limits 20/min per IP — pace the
// live run or every case 429s into the fallback and the results mean nothing.
const PACE_MS = Number(process.env.EVAL_PACE_MS ?? 7000);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function run(c: Case, comfort: number): Promise<CompleteResult> {
  if (!live) return completeOccasion(c.basket, c.context, comfort);
  await sleep(PACE_MS);
  const res = await fetch(`${BASE}/api/infer-occasion`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      session_id: crypto.randomUUID(),
      basket: c.basket,
      context: c.context,
      comfort,
    }),
  });
  if (res.status === 429) throw new Error(`rate limited by ${BASE} — raise EVAL_PACE_MS`);
  if (!res.ok) throw new Error(`${res.status} from ${BASE}`);
  return res.json();
}

function check(c: Case, r: CompleteResult): string[] {
  const fails: string[] = [];
  const basketCats = new Set(c.basket.map((i) => i.category));

  // 1 — occasion matches
  if (r.occasion_id !== c.expect_occasion) {
    fails.push(`occasion ${r.occasion_id} != ${c.expect_occasion}`);
  }

  // 5 — "none" returns nothing
  if (c.expect_occasion === "none") {
    if (r.suggestions.length) fails.push(`expected 0 suggestions, got ${r.suggestions.length}`);
    return fails;
  }

  if (r.suggestions.length < 2 || r.suggestions.length > 4) {
    fails.push(`expected 2-4 suggestions, got ${r.suggestions.length}`);
  }

  // 2 — never a category already in the basket
  for (const s of r.suggestions) {
    if (basketCats.has(s.category)) fails.push(`suggested in-basket category ${s.category}`);
    if (!s.why_now?.trim()) fails.push(`${s.product_id} has no why_now`);
  }

  // 3 — at least one expected new category
  const any = c.expect_new_categories_any_of ?? [];
  if (any.length && !r.suggestions.some((s) => any.includes(s.category))) {
    fails.push(`none of ${any.join("/")} suggested`);
  }

  // 4 — high-consideration items carry a trust cue
  if (c.must_include_confidence_note) {
    for (const s of r.suggestions) {
      if (isHighConsideration(s.category) && !s.confidence?.trim()) {
        fails.push(`${s.product_id} (${s.category}) missing confidence note`);
      }
    }
  }
  return fails;
}

const COMFORTS = [0, 50, 100];

async function main() {
  let failed = 0;
  let fellBack = 0;
  console.log(`occasion-golden · ${live ? `live @ ${BASE}` : "offline (deterministic)"}\n`);

  for (const c of golden as Case[]) {
    for (const comfort of COMFORTS) {
      const r = await run(c, comfort);
      const fails = check(c, r);
      // a live case that degraded measured the fallback, not the model
      const viaLlm = !live || !(r as { degraded?: boolean }).degraded;
      if (!viaLlm) fellBack++;
      const name = `${c.expect_occasion} @comfort=${comfort}${viaLlm ? "" : " [fellback]"}`;
      if (fails.length) {
        failed++;
        console.log(`  FAIL  ${name}`);
        fails.forEach((f) => console.log(`        - ${f}`));
      } else {
        console.log(`  pass  ${name}  →  ${r.suggestions.map((s) => s.category).join(", ") || "—"}`);
      }
    }
  }

  console.log(failed ? `\n${failed} case(s) failed` : "\nall cases passed");
  if (fellBack) {
    console.log(
      `${fellBack} case(s) never reached the model (quota/timeout) — those measured the fallback.`,
    );
  }
  process.exit(failed ? 1 : 0);
}

main();
