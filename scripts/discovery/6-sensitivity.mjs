/**
 * Stage 6 — are the scoring weights load-bearing?
 *   node scripts/discovery/6-sensitivity.mjs
 * out: data/sensitivity.json
 *
 * The opportunity score (0.5 frequency / 0.3 severity / 0.2 segment spread) and
 * the strategic-fit score (0.5 core / 0.3 trial need / 0.2 new category) are
 * round numbers we chose. A reviewer is right to ask whether the conclusions
 * move if they change. This re-scores every theme across a grid of weightings
 * and a sweep of the confidence floor, and reports how much survives.
 *
 * No LLM calls — re-run freely.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const need = (p) => {
  if (!existsSync(p)) {
    console.error(`${p} not found — run the pipeline first`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(p, "utf8"));
};

const insights = need("data/insights.json");
const tagged = need("data/tagged.json");
const themes = insights.themes;

/* ---------- rank helpers ---------- */
/** Average ranks for ties, so a tie doesn't fabricate an ordering. */
function ranks(values) {
  const idx = values.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
  const out = new Array(values.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) out[idx[k][1]] = avg;
    i = j + 1;
  }
  return out;
}

/** Spearman = Pearson on ranks. 1.0 means the ordering is identical. */
function spearman(a, b) {
  const ra = ranks(a);
  const rb = ranks(b);
  const n = ra.length;
  const mean = (x) => x.reduce((s, v) => s + v, 0) / n;
  const ma = mean(ra);
  const mb = mean(rb);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (ra[i] - ma) * (rb[i] - mb);
    da += (ra[i] - ma) ** 2;
    db += (rb[i] - mb) ** 2;
  }
  return da && db ? num / Math.sqrt(da * db) : 1;
}

/** All (a,b,c) on a 0.05 grid summing to 1, each at least 0.1. */
function weightGrid(step = 0.05, min = 0.1) {
  const out = [];
  for (let a = min; a <= 1 - 2 * min + 1e-9; a += step)
    for (let b = min; b <= 1 - a - min + 1e-9; b += step) {
      const c = 1 - a - b;
      if (c >= min - 1e-9) out.push([Number(a.toFixed(2)), Number(b.toFixed(2)), Number(c.toFixed(2))]);
    }
  return out;
}

const maxFreq = Math.max(...themes.map((t) => t.frequency), 1e-4);
const opportunityWith = ([a, b, c]) =>
  themes.map((t) => 100 * (a * (t.frequency / maxFreq) + b * t.severity + c * t.segment_spread));
const fitWith = ([a, b, c]) =>
  themes.map(
    (t) =>
      a * t.strategic_components.core_relevance +
      b * t.strategic_components.trial_need +
      c * t.strategic_components.new_category,
  );

function analyse(label, baseWeights, scorer, topN = 3) {
  const base = scorer(baseWeights);
  const baseOrder = themes.map((t, i) => [t.id, base[i]]).sort((x, y) => y[1] - x[1]);
  const baseTop = baseOrder.slice(0, topN).map(([id]) => id);
  const grid = weightGrid();

  let topUnchanged = 0;
  let topSetUnchanged = 0;
  let minRho = 1;
  let sumRho = 0;
  const rankSpread = Object.fromEntries(themes.map((t) => [t.id, []]));

  for (const w of grid) {
    const s = scorer(w);
    const rho = spearman(base, s);
    minRho = Math.min(minRho, rho);
    sumRho += rho;
    const order = themes.map((t, i) => [t.id, s[i]]).sort((x, y) => y[1] - x[1]);
    if (order[0][0] === baseTop[0]) topUnchanged++;
    const top = order.slice(0, topN).map(([id]) => id);
    if (top.every((id) => baseTop.includes(id))) topSetUnchanged++;
    order.forEach(([id], i) => rankSpread[id].push(i + 1));
  }

  const volatility = Object.entries(rankSpread)
    .map(([id, rs]) => ({
      id,
      label: themes.find((t) => t.id === id).label,
      best: Math.min(...rs),
      worst: Math.max(...rs),
      swing: Math.max(...rs) - Math.min(...rs),
    }))
    .sort((a, b) => b.swing - a.swing);

  return {
    label,
    base_weights: baseWeights,
    weightings_tested: grid.length,
    baseline_top: baseTop,
    top1_stable: Number((topUnchanged / grid.length).toFixed(3)),
    topN_set_stable: Number((topSetUnchanged / grid.length).toFixed(3)),
    mean_spearman: Number((sumRho / grid.length).toFixed(3)),
    min_spearman: Number(minRho.toFixed(3)),
    most_volatile: volatility.slice(0, 3),
    most_stable: volatility.slice(-3).reverse(),
  };
}

/* ---------- does the core-vs-context conclusion survive? ---------- */
const grid = weightGrid();
let coreLeadsStrategic = 0;
let contextLeadsRaw = 0;
for (const w of grid) {
  const fit = fitWith(w);
  const opp = opportunityWith([0.5, 0.3, 0.2]);
  const prio = themes.map((t, i) => [t, opp[i] * fit[i]]).sort((a, b) => b[1] - a[1]);
  if (prio[0][0].relevance === "core") coreLeadsStrategic++;

  const rawOrder = themes.map((t, i) => [t, opportunityWith(w)[i]]).sort((a, b) => b[1] - a[1]);
  if (rawOrder[0][0].relevance === "context") contextLeadsRaw++;
}

/* ---------- confidence floor sweep ---------- */
const codes = Object.values(tagged);
const floors = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((floor) => {
  const withTheme = codes.filter((c) => c.theme && c.theme !== "none");
  const accepted = withTheme.filter((c) => (Number(c.confidence) || 0) >= floor);
  const counts = {};
  for (const c of accepted) counts[c.theme] = (counts[c.theme] || 0) + 1;
  const sources = {};
  for (const c of accepted) (sources[c.theme] ??= new Set()).add(c.source);
  const valid = Object.keys(counts).filter((id) => (sources[id]?.size ?? 0) >= 2);
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return {
    floor,
    accepted: accepted.length,
    rejected_low_confidence: withTheme.length - accepted.length,
    themes_surviving_cross_source: valid.length,
    largest_theme: top ? top[0] : null,
  };
});

const report = {
  note:
    "Weights were chosen, not derived. This tests whether the conclusions depend on them. " +
    "Grid holds each weight at >= 0.10 and sums to 1.",
  opportunity: analyse("opportunity", [0.5, 0.3, 0.2], opportunityWith),
  strategic_fit: analyse("strategic_fit", [0.5, 0.3, 0.2], fitWith),
  conclusions: {
    core_theme_leads_strategic_priority: Number((coreLeadsStrategic / grid.length).toFixed(3)),
    context_theme_leads_raw_opportunity: Number((contextLeadsRaw / grid.length).toFixed(3)),
  },
  confidence_floor_sweep: floors,
};

writeFileSync("data/sensitivity.json", JSON.stringify(report, null, 1));

const pct = (x) => `${Math.round(x * 100)}%`;
for (const key of ["opportunity", "strategic_fit"]) {
  const r = report[key];
  console.log(`\n${key}  (${r.weightings_tested} weightings tested)`);
  console.log(`  top theme unchanged      ${pct(r.top1_stable)}`);
  console.log(`  top-3 set unchanged      ${pct(r.topN_set_stable)}`);
  console.log(`  Spearman vs baseline     mean ${r.mean_spearman}, worst ${r.min_spearman}`);
  console.log(`  most volatile            ${r.most_volatile.map((v) => `${v.label} (${v.best}-${v.worst})`).join(", ")}`);
}
console.log(`\nconclusions across all weightings`);
console.log(`  a CORE theme tops strategic priority     ${pct(report.conclusions.core_theme_leads_strategic_priority)}`);
console.log(`  a CONTEXT theme tops raw opportunity     ${pct(report.conclusions.context_theme_leads_raw_opportunity)}`);
console.log(`\nconfidence floor sweep`);
console.log(`  floor  accepted  rejected  themes  largest theme`);
for (const f of floors) {
  console.log(
    `   ${f.floor.toFixed(1)}   ${String(f.accepted).padStart(7)}  ${String(f.rejected_low_confidence).padStart(8)}  ` +
      `${String(f.themes_surviving_cross_source).padStart(6)}  ${f.largest_theme ?? "—"}`,
  );
}
console.log(`\nwrote data/sensitivity.json`);
