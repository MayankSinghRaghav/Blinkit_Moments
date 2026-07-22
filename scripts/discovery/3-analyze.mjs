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

  const quotes = items
    .filter((i) => i.quote)
    .sort((a, b) => (Number(b.confidence) || 0) - (Number(a.confidence) || 0))
    .slice(0, 6)
    .map((i) => ({
      quote: i.quote,
      source: i.source,
      url: i.url ?? byId.get(i.id)?.url ?? null,
      rating: i.rating ?? null,
      segment: i.segment,
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

themes.sort((a, b) => b.opportunity - a.opportunity);

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
console.log(`\ntop opportunities`);
for (const t of valid.slice(0, 6)) {
  console.log(
    `  ${String(t.opportunity).padStart(5)}  ${t.label.slice(0, 44).padEnd(46)} n=${String(t.count).padStart(3)}  ${t.sources.join("+")}`,
  );
}
console.log(`\nwrote ${OUT}`);
