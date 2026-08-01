import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { CATEGORIES, PRODUCTS, isHighConsideration } from "@/lib/data/catalog";
import { OCCASIONS, occasionById, type Occasion } from "@/lib/occasions";
import { completeOccasion, gapLine, MAX_SUGGESTIONS, type BasketItem, type CompleteResult } from "@/lib/scoring";
import { traceInference, type LLMSource } from "@/lib/telemetry";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const prompt = (name: string) =>
  readFileSync(join(process.cwd(), "prompts", `${name}.txt`), "utf8");

const fill = (tpl: string, vars: Record<string, string>) =>
  Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, v), tpl);

async function generate(text: string): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no-key");
  const res = await fetch(`${ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
        // 2.5-flash burns ~1.5k thinking tokens (~9s) on this prompt by default;
        // the task is a lookup against a fixed catalog, so skip it.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`llm ${res.status}`);
  const json = await res.json();
  const out = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof out !== "string") throw new Error("llm empty");
  return JSON.parse(out);
}

const CompleteSchema = z.object({
  occasion_id: z.string(),
  occasion_label: z.string(),
  confidence: z.number().min(0).max(1),
  suggestions: z.array(
    z.object({
      product_id: z.string(),
      category: z.string(),
      why_now: z.string().min(1),
      // model sends null (not undefined) for non-high-consideration items,
      // which .default() would not catch
      confidence: z
        .string()
        .nullish()
        .transform((v) => v ?? ""),
    }),
  ),
});

/** open-vocabulary occasions must clear a higher bar than the seeded six: the
 * rules give the seeded ones evidentiary backing, an invented one has only the
 * model's confidence, so demand more of it. */
const OPEN_OCCASION_FLOOR = 0.55;
const isOpenVocab = (r: CompleteResult): boolean => !occasionById(r.occasion_id);

/**
 * Resolve the occasion. Seeded ids get their catalog record. An id OUTSIDE the
 * seeded six is the one thing the deterministic matcher structurally cannot
 * produce — the rules only know the six — so we ACCEPT it as a first-class
 * occasion when it's well-formed and the model is confident, rather than
 * throwing it away. Suggestions are still validated against the real catalog
 * below, so grounding is identical for open and seeded occasions.
 */
function resolveOccasion(r: CompleteResult): Occasion {
  const seeded = occasionById(r.occasion_id);
  if (seeded) return seeded;
  const id = r.occasion_id;
  // a safe slug so /why links and adoption rows stay well-formed
  if (!/^[a-z][a-z0-9_]{1,39}$/.test(id)) throw new Error(`llm bad occasion id ${id}`);
  if (r.confidence < OPEN_OCCASION_FLOOR) throw new Error(`open occasion below floor: ${id} @ ${r.confidence}`);
  const label = r.occasion_label.trim();
  if (!label) throw new Error(`open occasion missing label: ${id}`);
  return { id, label, signal_categories: [], signal_keywords: [], target_categories: [], evidence: "" };
}

/** The model is allowed to be wrong, not to break the contract. */
function enforceRules(r: CompleteResult, basket: BasketItem[]): CompleteResult {
  if (r.occasion_id === "none" || r.confidence < 0.4) {
    return { ...r, occasion_id: "none", suggestions: [], gap_line: "" };
  }
  const occasion = resolveOccasion(r);
  const inBasket = new Set(basket.map((i) => i.category));
  const seen = new Set<string>();
  const suggestions = r.suggestions.filter((s) => {
    const p = PRODUCTS.find((x) => x.id === s.product_id);
    if (!p || p.category !== s.category) return false;
    if (inBasket.has(s.category) || seen.has(s.category)) return false;
    if (isHighConsideration(s.category) && !s.confidence.trim()) return false;
    seen.add(s.category);
    return true;
  });
  if (suggestions.length < 2) throw new Error("llm returned <2 usable suggestions");
  // same ceiling the deterministic path uses — the model does not get to
  // exceed a limit set by research
  const capped = suggestions.slice(0, MAX_SUGGESTIONS);
  // gap_line is computed from the basket + final suggestions, not taken from the
  // model, so it names exactly what is on screen and can't drift from it
  return {
    ...r,
    occasion_label: occasion.label,
    suggestions: capped,
    gap_line: gapLine(occasion, basket, capped),
  };
}

export type InferResult = CompleteResult & { degraded: boolean; source: LLMSource };

// ponytail: per-instance LRU, 200 entries / 10-min TTL. Serverless means each
// lambda holds its own copy — a cross-instance miss just recomputes, which is
// correct, not a bug. Only successful LLM answers are cached; a rules fallback
// is cheap and we want the next call to retry the model. Move to Upstash Redis
// only if a shared hit-rate ever matters.
const CACHE_MAX = 200;
const CACHE_TTL_MS = 10 * 60_000;
const cache = new Map<string, { at: number; result: InferResult }>();

const cacheKey = (basket: BasketItem[], context: string) =>
  basket.map((i) => i.product_id ?? i.name).sort().join(",") + "|" + context.trim().toLowerCase();

function cacheGet(key: string): InferResult | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  cache.delete(key); // reinsert to mark most-recently-used
  cache.set(key, hit);
  return hit.result;
}

function cacheSet(key: string, result: InferResult): void {
  cache.set(key, { at: Date.now(), result });
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value as string);
}

export async function inferOccasion(basket: BasketItem[], context: string): Promise<InferResult> {
  const started = Date.now();
  const key = cacheKey(basket, context);

  const cached = cacheGet(key);
  if (cached) {
    traceInference({
      source: "cache",
      occasion_id: cached.occasion_id,
      latency_ms: Date.now() - started,
      degraded: false,
      suggestions: cached.suggestions.length,
    });
    return { ...cached, source: "cache" };
  }

  try {
    const raw = await generate(
      fill(prompt("occasion_inference"), {
        basket: JSON.stringify(basket),
        context,
        catalog_categories: CATEGORIES.join(", "),
        occasions: OCCASIONS.map((o) => `${o.id} — ${o.label}`).join("\n"),
        catalog: PRODUCTS.map((p) => `${p.id} | ${p.name} | ${p.category} | ₹${p.price_inr}${p.starter ? " | starter" : ""}`).join("\n"),
      }),
    );
    const parsed = { ...CompleteSchema.parse(raw), gap_line: "" };
    const result: InferResult = { ...enforceRules(parsed, basket), degraded: false, source: "llm" };
    cacheSet(key, result);
    traceInference({
      source: "llm",
      occasion_id: result.occasion_id,
      latency_ms: Date.now() - started,
      degraded: false,
      suggestions: result.suggestions.length,
      open_vocab: result.occasion_id !== "none" && isOpenVocab(parsed),
    });
    return result;
  } catch (e) {
    // no key, quota exhausted, timeout, or a rule violation — deterministic path.
    // Logged, not swallowed: a demo that silently degrades looks like it works.
    if ((e as Error).message !== "no-key") {
      console.warn("[occasion] LLM fallback:", (e as Error).message);
    }
    const result: InferResult = { ...completeOccasion(basket, context), degraded: true, source: "rules" };
    traceInference({
      source: "rules",
      occasion_id: result.occasion_id,
      latency_ms: Date.now() - started,
      degraded: true,
      suggestions: result.suggestions.length,
    });
    return result;
  }
}

export type Explanation = { why_you_ll_like_it: string; why_its_a_stretch: string; degraded: boolean };

const ExplainSchema = z.object({
  why_you_ll_like_it: z.string().min(1),
  why_its_a_stretch: z.string().min(1),
});

export async function explain(productId: string, occasionLabel: string): Promise<Explanation> {
  const p = PRODUCTS.find((x) => x.id === productId);
  const fallback = {
    why_you_ll_like_it: p
      ? `${p.name} is the ${p.starter ? "smallest" : "simplest"} way into ${p.category} for ${occasionLabel.toLowerCase()} — ₹${p.price_inr}, nothing to commit to.`
      : "This item fits the occasion.",
    why_its_a_stretch: p && isHighConsideration(p.category)
      ? `${p.category} is a category you've never ordered here, so it's a genuine first try — start with the small pack.`
      : "It's outside your usual basket, so it may not land.",
    degraded: true,
  };
  if (!p) return fallback;
  try {
    const raw = await generate(
      fill(prompt("explain_suggestion"), {
        product: JSON.stringify(p),
        occasion: occasionLabel,
      }),
    );
    return { ...ExplainSchema.parse(raw), degraded: false };
  } catch {
    return fallback;
  }
}

export const llmConfigured = () => Boolean(process.env.GEMINI_API_KEY);
