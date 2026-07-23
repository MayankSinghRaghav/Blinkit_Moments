import type { Category } from "@/lib/data/catalog";

export type Occasion = {
  id: string;
  label: string;
  /** basket categories that imply this occasion */
  signal_categories: Category[];
  /** context keywords that imply it (lowercased substring match) */
  signal_keywords: string[];
  target_categories: Category[];
  /** why this occasion is in the catalog — see data/interviews/ */
  evidence: string;
};

/**
 * Seeded occasions, each mapped to the research that justifies it.
 *
 * Survey Q11 asked what prompted the last out-of-basket purchase (behavioural
 * recall, not a hypothetical): festival 31%, hosting 12%, season 4% — 46% of
 * all out-of-basket buying is occasion-triggered, against 19% for deals and 8%
 * for in-app recommendations. That is the mechanism this catalog encodes.
 *
 * Removed after the research, because nothing supported them:
 *   fitness_kickoff — 0 of 6 interviews, no survey prompt, 2 corpus keyword hits
 *   baby_arrival    — 0 of 6 interviews, no survey prompt
 * Both were inherited from the original build brief rather than from evidence.
 * baby_arrival is a plausible life-stage trigger and worth re-adding if a larger
 * sample surfaces it; it is out now because nothing in this research names it.
 */
export const OCCASIONS: Occasion[] = [
  {
    id: "festival_prep",
    label: "Festival prep",
    signal_categories: ["Desserts", "Home", "Snacks"],
    signal_keywords: ["diwali", "holi", "festival", "rakhi", "pooja", "celebration", "celebrating"],
    target_categories: ["Home", "Desserts", "Snacks"],
    evidence: "Survey Q11: the single largest out-of-basket trigger at 31%. Kabir: 'mostly when hosting people or during festivals'.",
  },
  {
    id: "hosting_guests",
    label: "Guests coming over",
    signal_categories: ["Beverages", "Snacks"],
    signal_keywords: ["host", "hosting", "guests", "people over", "friends over", "party"],
    target_categories: ["Home", "Desserts", "Snacks"],
    evidence: "Survey Q11: 12%. Kabir: 'if I'm buying beer for six people, remind me about ice, paper cups, dips, or desserts'. Aditya: 'a few friends were coming over'.",
  },
  {
    id: "game_night",
    label: "Game night",
    signal_categories: ["Beverages", "Snacks"],
    signal_keywords: ["match", "cricket", "ipl", "game", "friends", "fri", "sat"],
    target_categories: ["Home", "Desserts", "Mixers"],
    evidence: "Aditya: 'people hosting cricket nights'. Kabir describes the same basket gap for match viewing.",
  },
  {
    id: "movie_night",
    label: "Movie night",
    signal_categories: ["Snacks", "Desserts"],
    signal_keywords: ["movie", "film", "series", "binge", "netflix"],
    target_categories: ["Desserts", "Beverages", "Mixers"],
    evidence: "Sara, unprompted: 'if I'm ordering snacks for movie night, recommend popcorn seasoning or desserts'.",
  },
  {
    id: "new_pet",
    label: "New pet at home",
    signal_categories: ["Pet"],
    signal_keywords: ["first-time", "new pet", "puppy", "kitten", "adopted"],
    target_categories: ["Pet", "PersonalCare", "Home"],
    evidence: "Meghna, the one target-segment interviewee: 'I wasn't sure which brand to choose… went to Google and YouTube'.",
  },
  {
    id: "monsoon_evening",
    label: "Monsoon evening in",
    signal_categories: ["Snacks", "Beverages"],
    signal_keywords: ["rain", "monsoon", "storm", "cold"],
    target_categories: ["Wellness", "Desserts", "Snacks"],
    evidence: "Weakest of the six: survey Q11 season/weather 4%, corpus 'rain' 5 hits, 0 interviews. Retained as a seasonal case, flagged as thinly evidenced.",
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
