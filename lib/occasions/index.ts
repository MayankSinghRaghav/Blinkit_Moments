import type { Category } from "@/lib/data/catalog";

export type Occasion = {
  id: string;
  label: string;
  /** basket categories that imply this occasion */
  signal_categories: Category[];
  /** context keywords that imply it (lowercased substring match) */
  signal_keywords: string[];
  target_categories: Category[];
};

export const OCCASIONS: Occasion[] = [
  {
    id: "game_night",
    label: "Game night",
    signal_categories: ["Beverages", "Snacks"],
    signal_keywords: ["fri", "sat", "match", "game", "friends"],
    target_categories: ["Home", "Desserts", "Mixers"],
  },
  {
    id: "monsoon_evening",
    label: "Monsoon evening in",
    signal_categories: ["Snacks", "Beverages"],
    signal_keywords: ["rain", "monsoon", "cold", "storm"],
    target_categories: ["Wellness", "Desserts", "Snacks"],
  },
  {
    id: "new_pet",
    label: "New pet at home",
    signal_categories: ["Pet"],
    signal_keywords: ["first-time", "new pet", "puppy", "kitten", "adopted"],
    target_categories: ["Pet", "PersonalCare", "Home"],
  },
  {
    id: "baby_arrival",
    label: "New baby at home",
    signal_categories: ["Baby"],
    signal_keywords: ["newborn", "new baby", "first-time"],
    target_categories: ["Baby", "PersonalCare", "Home", "Wellness"],
  },
  {
    id: "fitness_kickoff",
    label: "Fitness kickoff",
    signal_categories: ["Wellness"],
    signal_keywords: ["gym", "workout", "fitness", "new year", "resolution"],
    target_categories: ["Wellness", "Beverages", "PersonalCare"],
  },
  {
    id: "festival_prep",
    label: "Festival prep",
    signal_categories: ["Desserts", "Home"],
    signal_keywords: ["diwali", "holi", "festival", "rakhi", "pooja"],
    target_categories: ["Home", "Desserts", "Snacks"],
  },
];

export const occasionById = (id: string) => OCCASIONS.find((o) => o.id === id);

export const CONFIDENCE_FLOOR = 0.4;

/**
 * Deterministic occasion matcher — the fallback path and the eval baseline.
 * Context keywords outrank category signals so "rainy Friday" reads as monsoon,
 * not game night.
 */
export function matchOccasion(
  basket: { category: string }[],
  context: string,
): { occasion: Occasion | null; confidence: number } {
  const cats = new Set(basket.map((i) => i.category));
  const ctx = context.toLowerCase();

  let best: Occasion | null = null;
  let bestScore = 0;

  for (const o of OCCASIONS) {
    const catHits = o.signal_categories.filter((c) => cats.has(c)).length;
    const kwHits = o.signal_keywords.filter((k) => ctx.includes(k)).length;
    // an occasion must be grounded in something actually in the basket —
    // context alone ("Fri 7pm") would otherwise fire on an empty cart
    if (catHits === 0) continue;
    const score = 0.25 * catHits + 0.25 * kwHits;
    if (score > bestScore) {
      bestScore = score;
      best = o;
    }
  }

  const confidence = best ? Math.min(0.95, bestScore + 0.15) : 0;
  if (!best || confidence < CONFIDENCE_FLOOR) return { occasion: null, confidence };
  return { occasion: best, confidence: Number(confidence.toFixed(2)) };
}
