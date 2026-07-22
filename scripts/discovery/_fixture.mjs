/**
 * Builds a FIXTURE coding of the real corpus so stages 3-4 and the dashboard can
 * be developed and tested without spending the 20-calls-per-day LLM budget.
 * Deterministic (seeded), and writes to *.sample.json so it can never be
 * mistaken for real output.
 *
 *   node scripts/discovery/_fixture.mjs
 * out: data/taxonomy.sample.json, data/tagged.sample.json
 */
import { readFileSync, writeFileSync } from "node:fs";

const corpus = JSON.parse(readFileSync("data/corpus.json", "utf8"));

const THEMES = [
  ["habit_autopilot", "Ordering the same basket on autopilot", "User describes reordering the same items without browsing.", "core"],
  ["discovery_is_search_only", "Discovery happens only through search", "User finds products by typing a known name, not by browsing.", "core"],
  ["trust_gap_new_category", "Won't risk an unfamiliar category", "User hesitates to buy an unfamiliar category without knowing quality.", "core"],
  ["pack_size_too_big", "First purchase feels too expensive to risk", "User wants a smaller/cheaper way to try something new.", "core"],
  ["didnt_know_stocked", "Unaware the category exists on the app", "User did not know the platform sold that category.", "core"],
  ["delivery_reliability", "Delivery and order accuracy", "Missing items, wrong items, late delivery.", "context"],
  ["pricing_and_charges", "Pricing, surge and handling fees", "Complaints about fees, surge pricing, or value.", "context"],
  ["support_quality", "Customer support quality", "Unresolved complaints, scripted replies, refunds.", "context"],
];

const SEGMENTS = ["routine_replenisher", "deal_seeker", "new_life_stage", "urban_professional", "power_user", "unclear"];
const CATS = ["Groceries", "Snacks", "Household", "Pet", "Baby", "PersonalCare", "Wellness", null];

// deterministic PRNG so the fixture is stable across runs
let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const tagged = {};
for (const d of corpus) {
  // real reviews skew to complaints; bias the fixture the same way so the
  // scoring stage gets a realistic distribution rather than a uniform one
  const theme = rand() < 0.55 ? pick(THEMES.slice(5)) : pick(THEMES);
  const sentence = (d.text.match(/[^.!?]{25,180}[.!?]/) || [d.text.slice(0, 120)])[0].trim();
  tagged[d.id] = {
    theme: theme[0],
    segment: pick(SEGMENTS),
    unmet_need: rand() < 0.6 ? pick(["smaller trial pack", "know if quality is good", "see what else is stocked", "reliable delivery", "fair pricing"]) : null,
    sentiment: rand() < 0.62 ? "negative" : rand() < 0.7 ? "neutral" : "positive",
    category_context: pick(CATS),
    confidence: Number((0.55 + rand() * 0.4).toFixed(2)),
    quote: sentence,
    source: d.source,
    url: d.url,
    rating: d.rating,
  };
}

writeFileSync(
  "data/taxonomy.sample.json",
  JSON.stringify(THEMES.map(([id, label, definition, relevance]) => ({ id, label, definition, relevance })), null, 2),
);
writeFileSync("data/tagged.sample.json", JSON.stringify(tagged, null, 1));
console.log(`fixture: ${Object.keys(tagged).length} docs coded across ${THEMES.length} themes`);
