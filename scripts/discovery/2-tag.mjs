/**
 * Stage 2 — LLM coding, in two passes.
 *   node scripts/discovery/2-tag.mjs
 *
 * Pass A (open coding): induce a theme codebook from a stratified sample, so the
 *   taxonomy comes from the data rather than from our assumptions.
 * Pass B (closed coding): classify every document against that codebook.
 *
 * Resumable: every batch is written to data/tagged.json as it completes, and a
 * re-run skips documents already coded. Free-tier quota will interrupt this;
 * just run it again.
 *
 * in:  data/corpus.json      out: data/taxonomy.json, data/tagged.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const MODEL = "gemini-2.5-flash";
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error("GEMINI_API_KEY missing — run with: npm run discovery:tag");
  process.exit(1);
}

// The Gemini free tier allows 20 generateContent calls PER DAY, so the batch
// size is set by that budget, not by what the model finds comfortable:
// 2 open-coding calls + ceil(1284/120) classification calls = 13 calls total.
// Flash has a 1M context; 100 docs/call is nowhere near the ceiling.
const BATCH = 120;
const OPEN_BATCH = 60;
const SAMPLE = 120; // documents used for open coding
const PACE_MS = 4500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const prompt = (n) => readFileSync(`prompts/${n}.txt`, "utf8");
const fill = (t, v) => Object.entries(v).reduce((s, [k, x]) => s.replaceAll(`{{${k}}}`, x), t);

async function generate(text, attempt = 0) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: AbortSignal.timeout(90_000),
    },
  );
  if (res.status === 429) {
    if (attempt >= 3) throw new Error("quota exhausted");
    const wait = 20_000 * (attempt + 1);
    console.log(`    429 — waiting ${wait / 1000}s`);
    await sleep(wait);
    return generate(text, attempt + 1);
  }
  if (!res.ok) throw new Error(`llm ${res.status}`);
  const j = await res.json();
  const out = j?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!out) throw new Error("empty completion");
  return JSON.parse(out);
}

const docLines = (docs) =>
  docs.map((d) => `[${d.id}] (${d.source}) ${d.text.slice(0, 700)}`).join("\n\n");

const corpus = JSON.parse(readFileSync("data/corpus.json", "utf8"));

/* ---------- Pass A: open coding ---------- */
async function buildTaxonomy() {
  if (existsSync("data/taxonomy.json")) {
    return JSON.parse(readFileSync("data/taxonomy.json", "utf8"));
  }
  // stratified round-robin across every source, so no single one dominates the
  // induced taxonomy — App Store was silently excluded when this was hardcoded
  const bySource = new Map();
  for (const d of corpus) {
    if (!bySource.has(d.source)) bySource.set(d.source, []);
    bySource.get(d.source).push(d);
  }
  const lists = [...bySource.values()];
  const sample = [];
  for (let i = 0; sample.length < SAMPLE && lists.some((l) => l[i]); i++) {
    for (const l of lists) if (l[i] && sample.length < SAMPLE) sample.push(l[i]);
  }
  console.log(
    `  sample sources: ${[...bySource.keys()]
      .map((s) => `${s} ${sample.filter((d) => d.source === s).length}`)
      .join(", ")}`,
  );

  console.log(`Pass A — open coding ${sample.length} docs`);
  // resume from a partial codebook if a previous run ran out of quota mid-pass
  const themes = new Map(
    existsSync("data/taxonomy.partial.json")
      ? JSON.parse(readFileSync("data/taxonomy.partial.json", "utf8")).map((t) => [t.id, t])
      : [],
  );
  for (let i = 0; i < sample.length; i += OPEN_BATCH) {
    const batch = sample.slice(i, i + OPEN_BATCH);
    try {
      const out = await generate(fill(prompt("discovery_opencode"), { documents: docLines(batch) }));
      for (const t of out.themes ?? []) if (t.id) themes.set(t.id, t);
    } catch (e) {
      // never lose induced themes to a quota error
      writeFileSync("data/taxonomy.partial.json", JSON.stringify([...themes.values()], null, 2));
      console.error(`  stopped: ${e.message} — ${themes.size} themes saved, re-run to continue`);
      process.exit(1);
    }
    console.log(`  batch ${i / OPEN_BATCH + 1}: ${themes.size} distinct themes so far`);
    await sleep(PACE_MS);
  }

  const taxonomy = [...themes.values()];
  writeFileSync("data/taxonomy.json", JSON.stringify(taxonomy, null, 2));
  console.log(`  codebook: ${taxonomy.length} themes\n`);
  return taxonomy;
}

/* ---------- Pass B: closed coding ---------- */
async function classify(taxonomy) {
  const tagged = existsSync("data/tagged.json")
    ? JSON.parse(readFileSync("data/tagged.json", "utf8"))
    : {};
  const todo = corpus.filter((d) => !tagged[d.id]);
  console.log(`Pass B — ${todo.length} of ${corpus.length} still to code`);

  const codebook = taxonomy
    .map((t) => `${t.id} | ${t.label} | ${t.definition} | ${t.relevance}`)
    .join("\n");

  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    try {
      const out = await generate(
        fill(prompt("discovery_classify"), { codebook, documents: docLines(batch) }),
      );
      const byId = new Map(batch.map((d) => [d.id, d]));
      for (const c of out.codes ?? []) {
        const doc = byId.get(c.id);
        if (!doc) continue; // model hallucinated an id
        // a quote must actually be in the document, else drop it
        const quote =
          c.quote && doc.text.toLowerCase().includes(c.quote.slice(0, 40).toLowerCase())
            ? c.quote
            : null;
        tagged[doc.id] = { ...c, quote, source: doc.source, url: doc.url, rating: doc.rating };
      }
      writeFileSync("data/tagged.json", JSON.stringify(tagged, null, 1));
      console.log(`  ${Object.keys(tagged).length}/${corpus.length} coded`);
    } catch (e) {
      writeFileSync("data/tagged.json", JSON.stringify(tagged, null, 1));
      console.error(`  stopped: ${e.message} — progress saved, re-run to continue`);
      return tagged;
    }
    await sleep(PACE_MS);
  }
  return tagged;
}

const taxonomy = await buildTaxonomy();
const tagged = await classify(taxonomy);
console.log(`\ndone: ${Object.keys(tagged).length}/${corpus.length} documents coded`);
