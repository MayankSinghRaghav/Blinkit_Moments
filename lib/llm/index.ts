import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { CATEGORIES, PRODUCTS, isHighConsideration } from "@/lib/data/catalog";
import { completeOccasion, type BasketItem, type CompleteResult } from "@/lib/scoring";

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
      generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
    }),
    signal: AbortSignal.timeout(15_000),
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
      confidence: z.string().default(""),
    }),
  ),
});

/** The model is allowed to be wrong, not to break the contract. */
function enforceRules(r: CompleteResult, basket: BasketItem[]): CompleteResult {
  if (r.occasion_id === "none" || r.confidence < 0.4) {
    return { ...r, occasion_id: "none", suggestions: [] };
  }
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
  if (suggestions.length < 2) throw new Error("llm violated rules");
  return { ...r, suggestions: suggestions.slice(0, 4) };
}

export type InferResult = CompleteResult & { degraded: boolean };

export async function inferOccasion(
  basket: BasketItem[],
  context: string,
  comfort: number,
): Promise<InferResult> {
  try {
    const raw = await generate(
      fill(prompt("occasion_inference"), {
        basket: JSON.stringify(basket),
        context,
        comfort: String(comfort),
        catalog_categories: CATEGORIES.join(", "),
        catalog: PRODUCTS.map((p) => `${p.id} | ${p.name} | ${p.category} | ₹${p.price_inr}${p.starter ? " | starter" : ""}`).join("\n"),
      }),
    );
    return { ...enforceRules(CompleteSchema.parse(raw), basket), degraded: false };
  } catch {
    // no key, quota exhausted, timeout, or a rule violation — deterministic path
    return { ...completeOccasion(basket, context, comfort), degraded: true };
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
