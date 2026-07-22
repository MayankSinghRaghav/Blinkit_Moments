/**
 * Stage 4 — validate the LLM coding against a human.
 *
 *   node scripts/discovery/4-holdout.mjs           # emit a blind coding sheet
 *   node scripts/discovery/4-holdout.mjs --score   # score it once you've filled it in
 *
 * The sheet deliberately does NOT contain the model's label — seeing it would
 * anchor the coder and inflate agreement. Reports raw agreement and Cohen's
 * kappa, which corrects for agreement that would happen by chance alone.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};
const INPUT = arg("--input", "data/tagged.json");
const TAXONOMY = arg("--taxonomy", "data/taxonomy.json");
const SHEET = "data/holdout.csv";
const CODED = "data/holdout-coded.csv";
const N = Number(arg("--n", 60));

const csvCell = (s) => `"${String(s ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

function parseCsv(text) {
  // small hand-rolled parser — the sheet is ours, quotes are the only quoting
  const rows = [];
  let row = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x !== ""));
}

if (!existsSync(INPUT)) {
  console.error(`${INPUT} not found — run the tagger first`);
  process.exit(1);
}
const tagged = JSON.parse(readFileSync(INPUT, "utf8"));
const corpus = new Map(JSON.parse(readFileSync("data/corpus.json", "utf8")).map((d) => [d.id, d]));

/* ---------- score mode ---------- */
if (process.argv.includes("--score")) {
  if (!existsSync(CODED)) {
    console.error(`${CODED} not found. Fill in the human_theme column of ${SHEET} and save it as ${CODED}.`);
    process.exit(1);
  }
  const rows = parseCsv(readFileSync(CODED, "utf8"));
  const head = rows[0].map((h) => h.trim());
  const iId = head.indexOf("id");
  const iHuman = head.indexOf("human_theme");
  if (iId < 0 || iHuman < 0) {
    console.error("coded file must keep the 'id' and 'human_theme' columns");
    process.exit(1);
  }

  const pairs = [];
  for (const r of rows.slice(1)) {
    const id = r[iId]?.trim();
    const human = r[iHuman]?.trim();
    if (!id || !human) continue; // uncoded rows are skipped, not counted as disagreement
    const llm = tagged[id]?.theme;
    if (!llm) continue;
    pairs.push([human, llm]);
  }

  if (!pairs.length) {
    console.error("no coded rows found — is the human_theme column filled in?");
    process.exit(1);
  }

  const agree = pairs.filter(([h, l]) => h === l).length;
  const po = agree / pairs.length;

  const labels = [...new Set(pairs.flat())];
  const pHuman = Object.fromEntries(labels.map((k) => [k, pairs.filter(([h]) => h === k).length / pairs.length]));
  const pLlm = Object.fromEntries(labels.map((k) => [k, pairs.filter(([, l]) => l === k).length / pairs.length]));
  const pe = labels.reduce((s, k) => s + pHuman[k] * pLlm[k], 0);
  const kappa = pe === 1 ? 1 : (po - pe) / (1 - pe);

  const strength =
    kappa < 0.2 ? "slight" : kappa < 0.4 ? "fair" : kappa < 0.6 ? "moderate" : kappa < 0.8 ? "substantial" : "almost perfect";

  const disagreements = pairs.filter(([h, l]) => h !== l);
  const confusion = {};
  for (const [h, l] of disagreements) confusion[`${h} → ${l}`] = (confusion[`${h} → ${l}`] || 0) + 1;

  const report = {
    coded_pairs: pairs.length,
    raw_agreement: Number(po.toFixed(3)),
    expected_by_chance: Number(pe.toFixed(3)),
    cohens_kappa: Number(kappa.toFixed(3)),
    interpretation: strength,
    top_confusions: Object.entries(confusion).sort((a, b) => b[1] - a[1]).slice(0, 8),
  };
  writeFileSync("data/holdout-report.json", JSON.stringify(report, null, 2));

  console.log(`pairs compared      ${report.coded_pairs}`);
  console.log(`raw agreement       ${(po * 100).toFixed(1)}%`);
  console.log(`expected by chance  ${(pe * 100).toFixed(1)}%`);
  console.log(`Cohen's kappa       ${report.cohens_kappa} (${strength})`);
  if (report.top_confusions.length) {
    console.log(`\nmost common disagreements (human → model)`);
    for (const [k, n] of report.top_confusions) console.log(`  ${n}x  ${k}`);
  }
  console.log(`\nwrote data/holdout-report.json`);
  process.exit(0);
}

/* ---------- sheet mode ---------- */
const taxonomy = existsSync(TAXONOMY) ? JSON.parse(readFileSync(TAXONOMY, "utf8")) : [];
const ids = Object.keys(tagged);

// stratify by source so the sample isn't all Play Store
const bySource = {};
for (const id of ids) (bySource[tagged[id].source] ||= []).push(id);
const sources = Object.keys(bySource);
const perSource = Math.ceil(N / sources.length);
const sample = sources.flatMap((s) => {
  const list = bySource[s];
  const step = Math.max(1, Math.floor(list.length / perSource));
  return list.filter((_, i) => i % step === 0).slice(0, perSource);
});

const lines = [
  ["id", "source", "text", "human_theme"].join(","),
  ...sample.map((id) =>
    [id, tagged[id].source, corpus.get(id)?.text?.slice(0, 900) ?? "", ""].map(csvCell).join(","),
  ),
];
writeFileSync(SHEET, lines.join("\n"));

console.log(`wrote ${SHEET} — ${sample.length} documents, stratified across ${sources.join(" + ")}`);
console.log(`\nCode the human_theme column using ONLY these ids:`);
for (const t of taxonomy) console.log(`  ${t.id.padEnd(28)} ${t.definition ?? t.label}`);
console.log(`  ${"none".padEnd(28)} nothing in the codebook fits`);
console.log(`\nThen save as ${CODED} and run:  node scripts/discovery/4-holdout.mjs --score`);
