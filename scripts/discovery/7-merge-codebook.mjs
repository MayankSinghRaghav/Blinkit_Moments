/**
 * Stage 7 — codebook refinement.
 *   node scripts/discovery/7-merge-codebook.mjs [--dry]
 *
 * Open coding produced 18 themes, several of which describe the same thing.
 * A second coder cannot reliably choose between "customer_support_failure" and
 * "poor_customer_support", so leaving them split would depress inter-coder
 * agreement for a codebook flaw rather than a coding one — and the hold-out
 * kappa would report that as if it were a quality problem.
 *
 * Merging near-duplicates before the reliability check is standard practice in
 * thematic analysis. Doing it AFTER seeing the kappa would not be.
 *
 * Also re-applies the core/context flag by a single stated rule, because the
 * original pass assigned it inconsistently — "privacy breaches" was flagged
 * core despite having nothing to do with category exploration.
 *
 * Originals are backed up, never overwritten in place.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");

/* ---------- merges, each with the reason it is a duplicate ---------- */
const MERGES = [
  {
    into: "customer_support",
    label: "Ineffective Customer Support",
    definition:
      "Users report unhelpful, unresponsive or inaccessible customer service: unresolved complaints, refusal to take responsibility, and unfulfilled refund promises.",
    from: ["customer_support_failure", "poor_customer_support"],
    why: "Definitions are near-identical — both describe unhelpful, unaccountable support. No coder could split them reliably.",
  },
  {
    into: "order_and_delivery_failures",
    label: "Order and Delivery Failures",
    definition:
      "The order did not arrive as promised: items incorrect, missing, damaged or short in quantity, wrong location, or poor handling by delivery personnel.",
    from: ["delivery_issues", "delivery_inconsistencies", "order_accuracy_issues"],
    why: "All three span 'what arrived was wrong' and 'how it arrived was wrong'. delivery_issues explicitly covers both, so the boundary between the three is not codeable.",
  },
  {
    into: "pricing_and_fees",
    label: "Pricing and Fees",
    definition:
      "Prices higher than market or other platforms, plus delivery charges, handling fees, surge pricing and minimum cart limits.",
    from: ["pricing_and_fees", "pricing_discrepancies"],
    why: "Both cover above-market prices AND added fees; the labels differ but the definitions overlap almost entirely.",
  },
  {
    into: "payment_and_refunds",
    label: "Payment, Cancellation and Refunds",
    definition:
      "Payment failures, duplicate orders, platform-side cancellations, cancellation fees, and refunds that are delayed or never arrive.",
    from: ["payment_and_refund_problems", "order_cancellation_and_refunds"],
    why: "Both centre on money not moving correctly — cancellations and refunds appear in each definition.",
  },
];

/* ---------- the core/context rule, applied uniformly ----------
 * CORE  = the definition describes a barrier to, or driver of, buying from a
 *         category the user has not bought before.
 * CONTEXT = everything else, however loud.
 *
 * Applied to every theme, including ones whose flag does not change, so the
 * rule can be checked rather than trusted.
 */
const RELEVANCE = {
  habitual_purchases_value_for_money: ["core", "Explicitly about sticking to known products and categories."],
  convenience_as_primary_driver: ["core", "Definition states convenience 'reinforces buying familiar items rather than exploring new ones' — a named mechanism for not exploring."],
  lack_of_category_exploration_deterrents: ["core", "Directly about being discouraged from trying new categories."],
  convenience_and_speed_value: ["context", "Appreciation of speed. Satisfaction with the service, with no exploration mechanism in the definition. NOT merged with convenience_as_primary_driver for exactly this reason."],
  product_quality_concerns: ["context", "Definition is about perishables arriving spoiled and items not matching description — an operational failure, not hesitancy about an unfamiliar category. Previously flagged core; this is the correction."],
  stock_availability_issues: ["context", "Concerns essentials being out of stock, not the discoverability of new categories. Previously core."],
  privacy_and_discretion_breaches: ["context", "Delivery-personnel discretion. No connection to category exploration. Previously core."],
  delivery_time_expectations: ["context", "Debate about the 10-minute promise and its effect on workers."],
  app_technical_issues: ["context", "Client bugs and misleading UX."],
  customer_support: ["context", "Service recovery failure."],
  order_and_delivery_failures: ["context", "Fulfilment failure."],
  pricing_and_fees: ["context", "Cost of the basket, not the cost of a first try."],
  payment_and_refunds: ["context", "Transaction failure."],
};

/* ---------- apply ---------- */
const taxonomy = JSON.parse(readFileSync("data/taxonomy.json", "utf8"));
const tagged = JSON.parse(readFileSync("data/tagged.json", "utf8"));

const remap = new Map();
for (const m of MERGES) for (const f of m.from) remap.set(f, m.into);

const before = {};
for (const c of Object.values(tagged)) if (c.theme) before[c.theme] = (before[c.theme] || 0) + 1;

// rebuild the taxonomy: merged entries replace their sources, survivors keep theirs
const merged = [];
const consumed = new Set(remap.keys());
for (const m of MERGES) {
  merged.push({ id: m.into, label: m.label, definition: m.definition, relevance: "context", merged_from: m.from, merge_reason: m.why });
}
for (const t of taxonomy) {
  if (consumed.has(t.id)) continue;
  merged.push({ ...t });
}

// apply the relevance rule and record the justification alongside it
const unruled = [];
for (const t of merged) {
  const r = RELEVANCE[t.id];
  if (!r) { unruled.push(t.id); continue; }
  t.relevance = r[0];
  t.relevance_reason = r[1];
}
if (unruled.length) {
  console.error(`no relevance rule for: ${unruled.join(", ")} — add one before merging`);
  process.exit(1);
}

// remap the coded documents
let moved = 0;
for (const c of Object.values(tagged)) {
  if (c.theme && remap.has(c.theme)) { c.theme = remap.get(c.theme); moved++; }
}

const after = {};
for (const c of Object.values(tagged)) if (c.theme) after[c.theme] = (after[c.theme] || 0) + 1;

console.log(`themes ${taxonomy.length} -> ${merged.length}   documents remapped: ${moved}\n`);
console.log("merges");
for (const m of MERGES) {
  const src = m.from.map((f) => `${f} (${before[f] ?? 0})`).join(" + ");
  console.log(`  ${src}\n    -> ${m.into} (${after[m.into] ?? 0})\n    ${m.why}`);
}
console.log("\nrelevance changes");
const wasCore = new Set(taxonomy.filter((t) => t.relevance === "core").map((t) => t.id));
for (const t of merged) {
  const was = wasCore.has(t.id) ? "core" : "context";
  if (was !== t.relevance) console.log(`  ${was} -> ${t.relevance.padEnd(7)} ${t.id}`);
}
console.log(`\ncore themes after: ${merged.filter((t) => t.relevance === "core").map((t) => `${t.id} (${after[t.id] ?? 0})`).join(", ")}`);

if (DRY) {
  console.log("\n--dry: nothing written");
  process.exit(0);
}

if (!existsSync("data/taxonomy.pre-merge.json")) {
  copyFileSync("data/taxonomy.json", "data/taxonomy.pre-merge.json");
  copyFileSync("data/tagged.json", "data/tagged.pre-merge.json");
  console.log("\nbacked up originals to *.pre-merge.json");
}
writeFileSync("data/taxonomy.json", JSON.stringify(merged, null, 2));
writeFileSync("data/tagged.json", JSON.stringify(tagged, null, 1));
console.log("wrote data/taxonomy.json and data/tagged.json — re-run discovery:analyze");
