import { z } from "zod";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";
import { addEvents, getSession, upsertSession } from "@/lib/store";
import {
  ADOPTION_DEPTH,
  ADOPTION_GOAL,
  adoptedCategories,
  completeOccasion,
  type AdoptionEvent,
} from "@/lib/scoring";

// The seeded demo basket (matches lib/session START). Used only to seed a cold
// session that landed straight on /tracker with no prior inference — so the
// simulated month is never empty. Grounded in the real engine output, not made up.
const DEMO_BASKET = [
  { name: "Kingfisher Ultra 6-pack", category: "Beverages" },
  { name: "Doritos Nacho Cheese 150g", category: "Snacks" },
];

export const runtime = "nodejs";

const Body = z.object({ session_id: z.uuid() });

/**
 * Fast-forwards a simulated month: every new category the session has seen gets
 * topped up to the 2 tried/repeat events that count as adoption.
 */
export async function POST(req: Request) {
  if (!rateLimit(clientKey(req.headers, "simulate"), 5)) return tooMany();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });
  const id = parsed.data.session_id;

  const { baseline, events } = await getSession(id);
  let base = new Set(baseline);

  const seen = new Map<string, { product_id: string; occasion_id?: string | null }>();
  const counts = new Map<string, number>();
  for (const e of events) {
    if (base.has(e.category)) continue;
    if (!seen.has(e.category)) seen.set(e.category, { product_id: e.product_id, occasion_id: e.occasion_id });
    if (e.event !== "suggested") counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  }

  // Cold session (landed straight on /tracker, nothing inferred yet): seed the
  // same suggestions the Shop/Moments screens would have produced for the demo
  // basket, so "simulate a month" always yields a populated example.
  if (seen.size === 0) {
    const demo = completeOccasion(DEMO_BASKET, "Fri 7pm");
    if (baseline.length === 0) {
      const demoBase = [...new Set(DEMO_BASKET.map((i) => i.category))];
      await upsertSession(id, { baseline: demoBase });
      base = new Set(demoBase);
    }
    for (const s of demo.suggestions) {
      if (!base.has(s.category)) seen.set(s.category, { product_id: s.product_id, occasion_id: demo.occasion_id });
    }
  }

  const fresh: AdoptionEvent[] = [];
  for (const [category, { product_id, occasion_id }] of [...seen].slice(0, ADOPTION_DEPTH)) {
    const have = counts.get(category) ?? 0;
    for (let i = have; i < 2; i++) {
      fresh.push({ product_id, category, event: i === 0 ? "tried" : "repeat", occasion_id });
    }
  }
  await addEvents(id, fresh);

  const after = await getSession(id);
  return Response.json({
    inserted: fresh.length,
    adopted: adoptedCategories(after.baseline, after.events),
    goal: ADOPTION_GOAL,
    depth: ADOPTION_DEPTH,
  });
}
