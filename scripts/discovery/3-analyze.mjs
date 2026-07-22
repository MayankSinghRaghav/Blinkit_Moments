/**
 * Stage 3 — cluster, validate, score. No LLM calls: this is deterministic so it
 * can be re-run freely and audited.
 *   node scripts/discovery/3-analyze.mjs [--input data/tagged.json]
 * out: data/insights.json  (read by /discovery)
 *
 * Validity rules (from the brief):
 *  - a theme is VALID only if it appears in >= 2 independent sources
 *  - every theme carries a confidence and links to verbatim source quotes
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const INPUT = arg("--input", "data/tagged.json");
const OUT = arg("--out", "data/insights.json");

if (!existsSync(INPUT)) {
  console.error(`${INPUT} not found — run: npm run discovery:tag`);
  process.exit(1);
}

const tagged = JSON.parse(readFileSync(INPUT, "utf8"));
const corpus = JSON.parse(readFileSync("data/corpus.json", "utf8"));
const TAXONOMY = arg("--taxonomy", "data/taxonomy.json");
const taxonomy = existsSync(TAXONOMY) ? JSON.parse(readFileSync(TAXONOMY, "utf8")) : [];

const byId = new Map(corpus.map((d) => [d.id, d]));
const meta = new Map(taxonomy.map((t) => [t.id, t]));
const codes = Object.entries(tagged).map(([id, c]) => ({ ...c, id }));
const coded = codes.filter((c) => c.theme && c.theme !== "none");

/* ---------- cluster by theme ---------- */
const clusters = new Map();
for (const c of coded) {
  if (!clusters.has(c.theme)) clusters.set(c.theme, []);
  clusters.get(c.theme).push(c);
}

const SEGMENTS = [
  "routine_replenisher",
  "deal_seeker",
  "new_life_stage",
  "urban_professional",
  "power_user",
];

const share = (n, d) => (d ? n / d : 0);

const themes = [...clusters.entries()].map(([id, items]) => {
  const sources = [...new Set(items.map((i) => i.source))];
  const segments = {};
  for (const i of items) {
    const s = SEGMENTS.includes(i.segment) ? i.segment : "unclear";
    segments[s] = (segments[s] || 0) + 1;
  }
  const needs = {};
  for (const i of items) if (i.unmet_need) needs[i.unmet_need] = (needs[i.unmet_need] || 0) + 1;
  const categories = {};
  for (const i of items) if (i.category_context) categories[i.category_context] = (categories[i.category_context] || 0) + 1;

  const negative = items.filter((i) => i.sentiment === "negative").length;
  const confidence = share(
    items.reduce((s, i) => s + (Number(i.confidence) || 0), 0),
    items.length,
  );

  // Store a generous pool of candidates with the fields the display filter
  // needs (confidence, owning theme). The UI shows at most 3 after filtering;
  // keeping 12 here means a theme whose best quotes are junk still has clean
  // ones to fall back on. Nothing is discarded from data/tagged.json.
  const quotes = items
    .filter((i) => i.quote)
    .sort((a, b) => (Number(b.confidence) || 0) - (Number(a.confidence) || 0))
    .slice(0, 12)
    .map((i) => ({
      quote: i.quote,
      source: i.source,
      url: i.url ?? byId.get(i.id)?.url ?? null,
      rating: i.rating ?? null,
      segment: i.segment,
      confidence: Number(i.confidence) || 0,
      theme: i.theme,
    }));

  const t = meta.get(id);
  return {
    id,
    label: t?.label ?? id.replace(/_/g, " "),
    definition: t?.definition ?? null,
    relevance: t?.relevance ?? "context",
    count: items.length,
    frequency: share(items.length, coded.length),
    severity: share(negative, items.length),
    confidence,
    sources,
    cross_source_valid: sources.length >= 2,
    per_source: sources.reduce(
      (a, s) => ({ ...a, [s]: items.filter((i) => i.source === s).length }),
      {},
    ),
    segments,
    segment_spread: share(
      Object.keys(segments).filter((s) => s !== "unclear").length,
      SEGMENTS.length,
    ),
    top_needs: Object.entries(needs).sort((a, b) => b[1] - a[1]).slice(0, 5),
    categories: Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5),
    quotes,
  };
});

/* ---------- opportunity score ----------
 * Explicit and defensible rather than clever: how often it comes up, how badly
 * it lands, and how widely it spreads across segments. Frequency is normalised
 * against the largest theme so the scale is readable.
 */
const maxFreq = Math.max(...themes.map((t) => t.frequency), 0.0001);
for (const t of themes) {
  t.opportunity = Number(
    (100 * (0.5 * (t.frequency / maxFreq) + 0.3 * t.severity + 0.2 * t.segment_spread)).toFixed(1),
  );
}

/* ---------- strategic fit ----------
 * Opportunity measures share of voice. It answers "what do users complain about
 * most", which is NOT the question the company goal asks — that goal is share of
 * customers buying from a new category each month. Delivery and pricing will
 * always win on volume; that is a real finding, not a scoring bug, so the raw
 * score is left untouched and a second axis is added beside it.
 *
 * Strategic fit is computed from the coding, never hand-set:
 *   0.5  the open-coded relevance flag ("core"), assigned during open coding
 *        before any score existed, so it cannot be reverse-engineered from rank
 *   0.3  share of the theme's documents whose unmet_need is about trialling
 *        something unfamiliar (lexicon below)
 *   0.2  share whose category_context is a category the user would be new to
 *
 * strategic_priority = opportunity x strategic_fit — a loud theme that has
 * nothing to do with exploration scores near zero on it, and a quiet theme that
 * is entirely about exploration keeps most of its raw value.
 */
const EXPLORATION_NEED = /\b(trial|try|trying|sample|small(er)?|starter|pack size|risk|unsure|unfamiliar|quality|know if|first[- ]time|worth it)\b/i;
const NEW_TO_USER_CATEGORIES = ["Pet", "Baby", "PersonalCare", "Wellness"];

const STRATEGIC_WEIGHTS = { core_relevance: 0.5, trial_need: 0.3, new_category: 0.2 };

for (const t of themes) {
  const items = clusters.get(t.id);
  const trialNeed = share(
    items.filter((i) => i.unmet_need && EXPLORATION_NEED.test(i.unmet_need)).length,
    items.length,
  );
  const newCategory = share(
    items.filter((i) => NEW_TO_USER_CATEGORIES.includes(i.category_context)).length,
    items.length,
  );
  const coreFlag = t.relevance === "core" ? 1 : 0;

  t.strategic_components = {
    core_relevance: coreFlag,
    trial_need: Number(trialNeed.toFixed(3)),
    new_category: Number(newCategory.toFixed(3)),
  };
  t.strategic_fit = Number(
    (
      STRATEGIC_WEIGHTS.core_relevance * coreFlag +
      STRATEGIC_WEIGHTS.trial_need * trialNeed +
      STRATEGIC_WEIGHTS.new_category * newCategory
    ).toFixed(3),
  );
  t.strategic_priority = Number((t.opportunity * t.strategic_fit).toFixed(1));
}

themes.sort((a, b) => b.opportunity - a.opportunity);

/* ---------- the bridge ----------
 * Where price-risk and the exploration barrier are the same complaint. Counted,
 * not asserted: documents whose unmet_need is about trialling something
 * unfamiliar, split by whether they landed in a core or a context theme. The
 * context-theme half is the interesting number — those are users filed under
 * "pricing" who are actually describing the cost of a first try.
 */
const relevanceOf = new Map(themes.map((t) => [t.id, t.relevance]));
const trialNeedDocs = coded.filter((c) => c.unmet_need && EXPLORATION_NEED.test(c.unmet_need));
const sharedNeeds = {};
for (const c of trialNeedDocs) sharedNeeds[c.unmet_need] = (sharedNeeds[c.unmet_need] || 0) + 1;

const bridge = {
  lexicon: EXPLORATION_NEED.source,
  trial_need_docs: trialNeedDocs.length,
  share_of_coded: Number(share(trialNeedDocs.length, coded.length).toFixed(3)),
  in_core_themes: trialNeedDocs.filter((c) => relevanceOf.get(c.theme) === "core").length,
  in_context_themes: trialNeedDocs.filter((c) => relevanceOf.get(c.theme) !== "core").length,
  top_shared_needs: Object.entries(sharedNeeds).sort((a, b) => b[1] - a[1]).slice(0, 5),
  quotes: trialNeedDocs
    .filter((c) => c.quote && relevanceOf.get(c.theme) !== "core")
    .sort((a, b) => (Number(b.confidence) || 0) - (Number(a.confidence) || 0))
    .slice(0, 12)
    .map((c) => ({
      quote: c.quote,
      source: c.source,
      theme: c.theme,
      url: c.url ?? null,
      rating: c.rating ?? null,
      segment: c.segment,
      confidence: Number(c.confidence) || 0,
    })),
};

const valid = themes.filter((t) => t.cross_source_valid);
const rejected = themes.filter((t) => !t.cross_source_valid);

const insights = {
  generated_from: INPUT,
  corpus: {
    documents: corpus.length,
    coded: codes.length,
    with_theme: coded.length,
    unclassified: codes.length - coded.length,
    by_source: corpus.reduce((a, d) => ({ ...a, [d.source]: (a[d.source] || 0) + 1 }), {}),
    sources: [...new Set(corpus.map((d) => d.source))],
  },
  scoring: {
    opportunity:
      "0.5 x frequency (normalised to the largest theme) + 0.3 x negative sentiment + 0.2 x segment spread. Measures share of voice.",
    strategic_fit:
      "0.5 x open-coded 'core' relevance + 0.3 x share of documents whose unmet need is about trialling something unfamiliar + 0.2 x share whose category context is one the user would be new to. Measures fit with the goal of new-category adoption.",
    strategic_priority: "opportunity x strategic_fit",
    weights: STRATEGIC_WEIGHTS,
    note: "Raw opportunity is never adjusted. The two axes are reported side by side because the loudest theme and the most strategically relevant theme are not the same theme, and hiding that would be dishonest.",
  },
  bridge,
  validity: {
    rule: "A theme is reported only if it appears in at least 2 independent sources.",
    valid_themes: valid.length,
    rejected_themes: rejected.map((t) => ({ id: t.id, label: t.label, sources: t.sources, count: t.count })),
  },
  themes: valid,
  segments: SEGMENTS.map((s) => ({
    id: s,
    count: coded.filter((c) => c.segment === s).length,
    // which themes this segment over-indexes on
    top_themes: valid
      .map((t) => ({ id: t.id, label: t.label, n: t.segments[s] || 0 }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 3),
  })).sort((a, b) => b.count - a.count),
};

writeFileSync(OUT, JSON.stringify(insights, null, 1));

console.log(`corpus      ${insights.corpus.documents} docs, ${insights.corpus.with_theme} themed`);
console.log(`themes      ${themes.length} induced, ${valid.length} pass the cross-source rule`);
if (rejected.length) console.log(`rejected    ${rejected.map((t) => t.id).join(", ")}`);
const row = (t) =>
  `  ${String(t.opportunity).padStart(5)}  ${String(t.strategic_fit.toFixed(2)).padStart(5)}  ${String(t.strategic_priority).padStart(5)}  ${t.label.slice(0, 40).padEnd(42)} ${t.relevance}`;

console.log(`\n         raw    fit  strat  theme`);
console.log(`by share of voice`);
for (const t of valid.slice(0, 5)) console.log(row(t));
console.log(`\nby strategic priority`);
for (const t of [...valid].sort((a, b) => b.strategic_priority - a.strategic_priority).slice(0, 5)) {
  console.log(row(t));
}
console.log(
  `\nbridge      ${bridge.trial_need_docs} docs name a trial/risk need ` +
    `(${bridge.in_context_themes} of them sit in context themes, ${bridge.in_core_themes} in core)`,
);
console.log(`\nwrote ${OUT}`);
