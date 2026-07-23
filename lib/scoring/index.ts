import {
  PRODUCTS,
  HIGH_CONSIDERATION,
  isHighConsideration,
  type Category,
  type Product,
} from "@/lib/data/catalog";
import { matchOccasion, type Occasion } from "@/lib/occasions";

export type BasketItem = { product_id?: string; name: string; category: string };

export type Suggestion = {
  product_id: string;
  category: string;
  why_now: string;
  confidence: string;
};

/**
 * Research-set ceiling, not a tuning knob. Nikhil (interview 6) named the
 * failure mode directly; nobody asked for more.
 */
export const MAX_SUGGESTIONS = 3;

export type CompleteResult = {
  occasion_id: string;
  occasion_label: string;
  confidence: number;
  suggestions: Suggestion[];
};

const WHY: Record<string, Partial<Record<Category, string>>> = {
  festival_prep: {
    Home: "Lights and cleanup — the two things everyone forgets.",
    Desserts: "Guests will arrive with sweets. Have better ones.",
    Snacks: "Something to put out when people drop by unannounced.",
    PersonalCare: "A full house means the hand wash runs out first.",
  },
  hosting_guests: {
    Home: "Six people, one set of plates. Worth thinking about now.",
    Desserts: "Somebody always asks what's for after.",
    Snacks: "Drinks without something to eat is a short evening.",
    Mixers: "Turns the drinks run into an actual bar.",
    PersonalCare: "The guest bathroom is the one nobody checks until it's late.",
  },
  game_night: {
    Home: "Nobody wants to do dishes at midnight.",
    Desserts: "Half-time always ends with someone wanting something sweet.",
    Mixers: "Turns the beer run into an actual bar.",
    PersonalCare: "Post-party cleanup is easier with a hand wash by the sink.",
    Wellness: "Tomorrow-morning you will thank tonight-you.",
  },
  movie_night: {
    Desserts: "The second half is when the ice cream gets opened.",
    Beverages: "Something to sip that isn't finished in ten minutes.",
    Mixers: "Makes the interval feel deliberate.",
    Snacks: "Popcorn is better with something on it.",
  },
  new_pet: {
    Home: "First-week accidents happen — a pet-safe floor cleaner saves the day.",
    PersonalCare: "Hand wash by the door becomes a habit fast with a new pet.",
    Pet: "Rounds out the starter kit for a new pet.",
    Wellness: "New routine, less sleep — worth a small boost.",
  },
  monsoon_evening: {
    Wellness: "Damp evenings are when immunity packs actually get used.",
    Desserts: "Hot noodles, cold dessert — the classic rainy-day pairing.",
    Snacks: "Pakoras are the whole point of a rainy evening.",
    PersonalCare: "Wet weather is rough on skin.",
  },
};

function whyNow(occasion: Occasion, p: Product): string {
  return WHY[occasion.id]?.[p.category] ?? `${p.name} completes your ${occasion.label.toLowerCase()}.`;
}

function confidenceNote(p: Product): string {
  if (!isHighConsideration(p.category)) return "";
  const bits: string[] = [];
  if (p.starter) bits.push("Small starter pack");
  if (p.rating) bits.push(`${p.rating}★ (${p.reviews?.toLocaleString("en-IN")})`);
  if (p.proof) bits.push(p.proof);
  // every high-consideration item must carry a trust cue — never return ""
  return bits.length ? bits.join(" · ") : "New category — free returns on the first order";
}

/**
 * How far a category sits from the everyday basket. Used to order suggestions
 * so the familiar ones come first — high-consideration categories are a bigger
 * ask and go last.
 */
const boldness = (c: string) => (HIGH_CONSIDERATION.includes(c as Category) ? 2 : 1);

function pickProduct(category: string): Product | undefined {
  const inCat = PRODUCTS.filter((p) => p.category === category);
  return inCat.find((p) => p.starter) ?? inCat.sort((a, b) => a.price_inr - b.price_inr)[0];
}

/**
 * Deterministic occasion completion: infer the occasion, then suggest 2-4 items
 * from categories the basket does NOT contain. Shared by /api/infer-occasion,
 * /api/complete, and the eval harness.
 */
export function completeOccasion(basket: BasketItem[], context: string): CompleteResult {
  const { occasion, confidence } = matchOccasion(basket, context);
  if (!occasion) {
    return { occasion_id: "none", occasion_label: "No clear occasion", confidence, suggestions: [] };
  }

  const inBasket = new Set(basket.map((i) => i.category));
  // Familiar categories first: a suggestion the user can evaluate at a glance
  // earns the right to the ones they cannot.
  const cats = occasion.target_categories
    .filter((c) => !inBasket.has(c))
    .sort((a, b) => boldness(a) - boldness(b));

  // Capped at 3 on research, not taste. Nikhil, unprompted: "One or two useful
  // suggestions. Not ten" — and "if they're obviously trying to sell me more"
  // names exactly the failure mode a longer list produced.
  const suggestions = cats
    .slice(0, MAX_SUGGESTIONS)
    .map((c): Suggestion | null => {
      const p = pickProduct(c);
      if (!p) return null;
      return {
        product_id: p.id,
        category: p.category,
        why_now: whyNow(occasion, p),
        confidence: confidenceNote(p),
      };
    })
    .filter((s): s is Suggestion => s !== null);

  if (suggestions.length < 2) {
    return { occasion_id: "none", occasion_label: "No clear occasion", confidence: 0, suggestions: [] };
  }

  return {
    occasion_id: occasion.id,
    occasion_label: occasion.label,
    confidence,
    suggestions,
  };
}

export type AdoptionEvent = {
  product_id: string;
  category: string;
  /**
   * `dismissed` exists because the experiment design sets a dismiss-rate
   * guardrail, and a guardrail you cannot measure is decoration. It never
   * counts toward adoption — only toward whether the surface is annoying.
   */
  event: "suggested" | "tried" | "repeat" | "dismissed";
  occasion_id?: string | null;
};

/**
 * The company goal is "purchased from AT LEAST ONE new category this month",
 * so the metric is binary per customer. GOAL is what a session must cross to
 * count; DEPTH is the stretch we show alongside it, since breadth of adoption
 * is what turns a one-off trial into a habit.
 */
export const ADOPTION_GOAL = 1;
export const ADOPTION_DEPTH = 3;

/**
 * North Star: a category counts as adopted when it collects >= 2 tried/repeat
 * events AND the session did not start with that category.
 */
export function adoptedCategories(baseline: string[], events: AdoptionEvent[]): string[] {
  const base = new Set(baseline);
  const counts = new Map<string, number>();
  for (const e of events) {
    if (e.event === "suggested" || e.event === "dismissed") continue;
    if (base.has(e.category)) continue;
    counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n >= 2).map(([c]) => c);
}
