/**
 * Stage 1 — clean, dedupe, language-filter the raw scrapes into one corpus.
 *   node scripts/discovery/1-normalize.mjs
 * in:  data/raw/play-reviews.json, data/raw/reddit.json
 * out: data/corpus.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));

const MIN_CHARS = 60;
const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
const key = (s) =>
  createHash("sha1").update(s.toLowerCase().replace(/[^a-z0-9]/g, "")).digest("hex").slice(0, 16);

/** Keep predominantly-Latin text — the tagger and the reader both work in English. */
function isEnglish(text) {
  const letters = text.replace(/[^\p{L}]/gu, "");
  if (!letters) return false;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  return latin / letters.length > 0.85;
}

const docs = [];
const seen = new Set();
const dropped = { short: 0, nonEnglish: 0, duplicate: 0 };

function push(doc) {
  const text = norm(doc.text);
  if (text.length < MIN_CHARS) return dropped.short++;
  if (!isEnglish(text)) return dropped.nonEnglish++;
  const k = key(text);
  if (seen.has(k)) return dropped.duplicate++;
  seen.add(k);
  docs.push({ ...doc, text });
}

for (const r of read("data/raw/play-reviews.json")) {
  push({
    id: `play_${r.reviewId}`,
    source: "play_store",
    text: r.body,
    rating: r.rating ?? null,
    date: r.date ?? null,
    helpful: r.helpfulCounts ?? 0,
    url: `https://play.google.com/store/apps/details?id=${r.appId}`,
  });
}

for (const r of read("data/raw/reddit.json")) {
  const sub = r.communityName || r.subredditName || r.parsedCommunityName || null;
  push({
    id: `reddit_${key(norm(r.body || r.title) + (sub || ""))}`,
    source: "reddit",
    text: r.dataType === "post" ? `${norm(r.title)}. ${norm(r.body)}` : r.body,
    rating: null,
    date: r.createdAt || r.commentCreatedAt || null,
    helpful: r.upVotes ?? r.score ?? 0,
    subreddit: sub,
    url: r.url || r.postUrl || null,
  });
}

writeFileSync("data/corpus.json", JSON.stringify(docs, null, 1));

const bySource = docs.reduce((a, d) => ({ ...a, [d.source]: (a[d.source] || 0) + 1 }), {});
console.log("corpus:", docs.length, bySource);
console.log("dropped:", dropped);
