/**
 * Stage 5 — compute survey figures from the raw export.
 *   node scripts/discovery/5-survey.mjs
 * in:  data/interviews/survey-responses.csv
 * out: data/survey.json  (read by /discovery)
 *
 * The dashboard cites survey percentages next to corpus counts. Deriving them
 * here rather than typing them into JSX means the page cannot drift from the
 * CSV, and a reader can re-run this to check any number on screen.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const CSV = "data/interviews/survey-responses.csv";
if (!existsSync(CSV)) {
  console.error(`${CSV} not found`);
  process.exit(1);
}

/** Minimal RFC4180 parser — the file is a Google Forms export, quotes only. */
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

const rows = parseCsv(readFileSync(CSV, "utf8").replace(/^﻿/, ""));
const data = rows.slice(1);
const n = data.length;
const pct = (k) => Number((k / n).toFixed(3));
const norm = (s) => (s || "").replace(/[’‘]/g, "'").replace(/[—–]/g, "-").trim();

/* Q7 is multi-select and Google joins options with commas, which also appear
 * inside the option text. Substring matching against the known options is the
 * only reliable split. */
const BARRIERS = [
  ["habit_knows_what_they_need", "I open the app already knowing exactly what I need", "habit"],
  ["habit_search_not_browse", "I don't browse", "habit"],
  ["inertia_happy_with_basket", "I'm happy with what I already buy", "habit"],
  ["quality_uncertainty", "I'm not sure which product is the right one for me", "quality"],
  ["price_sensitivity", "It feels expensive", "price"],
  ["distrust_suggestions", "I don't trust the app", "trust"],
];
const barriers = BARRIERS.map(([id, needle, group]) => {
  const count = data.filter((r) => norm(r[7]).includes(norm(needle))).length;
  return { id, group, count, share: pct(count) };
}).sort((a, b) => b.count - a.count);

const tally = (idx) => {
  const c = {};
  for (const r of data) {
    const v = norm(r[idx]);
    if (v) c[v] = (c[v] || 0) + 1;
  }
  return Object.entries(c)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, share: pct(count) }));
};

const prompts = tally(11);
const OCCASION_PROMPTS = ["festival", "hosting", "season", "weather"];
const occasionDriven = prompts
  .filter((p) => OCCASION_PROMPTS.some((k) => p.label.toLowerCase().includes(k)))
  .reduce((s, p) => s + p.count, 0);

const recency = tally(6);
const RECENT = ["this week", "this month"];
const triedRecently = recency
  .filter((r) => RECENT.some((k) => r.label.toLowerCase().startsWith(k)))
  .reduce((s, r) => s + r.count, 0);

/** Likert 1-5: top-2 box is the standard read. */
const likert = (idx) => {
  const vals = data.map((r) => Number(norm(r[idx]))).filter((v) => v >= 1 && v <= 5);
  const top2 = vals.filter((v) => v >= 4).length;
  const neutral = vals.filter((v) => v === 3).length;
  return {
    n: vals.length,
    mean: Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)),
    top2_box: Number((top2 / vals.length).toFixed(3)),
    neutral: Number((neutral / vals.length).toFixed(3)),
  };
};

const out = {
  source: CSV,
  responses: n,
  caveats: [
    "Self-selected convenience sample; 84% under 35.",
    "n=26 supports whole-sample figures only — no subgroup analysis.",
    "Q12-Q14 describe the proposed solution and are stated preference, not behaviour.",
  ],
  barriers,
  barrier_groups: ["habit", "quality", "price", "trust"].map((g) => ({
    group: g,
    // a respondent ticking two habit options counts once for the group
    count: data.filter((r) =>
      BARRIERS.filter(([, , grp]) => grp === g).some(([, needle]) =>
        norm(r[7]).includes(norm(needle)),
      ),
    ).length,
  })).map((x) => ({ ...x, share: pct(x.count) })).sort((a, b) => b.count - a.count),
  out_of_basket_prompts: prompts,
  occasion_driven: { count: occasionDriven, share: pct(occasionDriven) },
  north_star_baseline: {
    tried_new_category_within_a_month: triedRecently,
    share: pct(triedRecently),
    breakdown: recency,
  },
  first_hear_about_product: tally(10),
  categories_per_month: tally(4),
  stated_preference: {
    occasion_suggestion: likert(12),
    reason_plus_reviews: likert(13),
    basket_completion: likert(14),
  },
  interview_willing: tally(18),
};

writeFileSync("data/survey.json", JSON.stringify(out, null, 1));

console.log(`survey  n=${n}`);
console.log(`\nbarrier groups`);
for (const g of out.barrier_groups) {
  console.log(`  ${String(Math.round(g.share * 100)).padStart(3)}%  ${g.group}  (${g.count})`);
}
console.log(`\nout-of-basket triggers`);
for (const p of prompts) {
  console.log(`  ${String(Math.round(p.share * 100)).padStart(3)}%  ${p.label.slice(0, 46)}`);
}
console.log(`\noccasion-driven      ${Math.round(out.occasion_driven.share * 100)}%`);
console.log(`north star baseline  ${Math.round(out.north_star_baseline.share * 100)}% tried a new category within a month`);
console.log(`\nwrote data/survey.json`);
