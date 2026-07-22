/**
 * Pulls App Store reviews from Apple's public RSS feed. No key, no account, no
 * cost — Apple serves this openly, 50 reviews per page, 10 pages per store.
 *
 *   node scripts/discovery/0-fetch-appstore.mjs
 * out: data/raw/appstore-reviews.json
 *
 * Multiple storefronts because any single one caps at ~500; `in` is the primary
 * market, the others add volume from the same app.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const APP_ID = 960335206; // Blinkit: Groceries & more
const STORES = ["in", "us", "gb", "ae", "sg", "ca", "au"];
const PAGES = 10;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reviews = [];
const seen = new Set();

for (const store of STORES) {
  let got = 0;
  for (let page = 1; page <= PAGES; page++) {
    const url = `https://itunes.apple.com/${store}/rss/customerreviews/page=${page}/id=${APP_ID}/sortby=mostrecent/json`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (!res.ok) break;
      const json = await res.json();
      const entries = json?.feed?.entry;
      if (!Array.isArray(entries) || entries.length === 0) break;

      for (const e of entries) {
        // the first entry of page 1 is the app itself, not a review
        if (!e["im:rating"] || !e.content?.label) continue;
        const id = e.id?.label;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        reviews.push({
          reviewId: id,
          store,
          rating: Number(e["im:rating"].label),
          title: e.title?.label ?? "",
          body: e.content.label,
          version: e["im:version"]?.label ?? null,
          author: e.author?.name?.label ?? null,
          date: e.updated?.label ?? null,
        });
        got++;
      }
    } catch {
      break; // a storefront that errors just contributes nothing
    }
    await sleep(300);
  }
  console.log(`  ${store}: ${got} reviews`);
}

mkdirSync("data/raw", { recursive: true });
writeFileSync("data/raw/appstore-reviews.json", JSON.stringify(reviews, null, 1));
console.log(`\nappstore: ${reviews.length} unique reviews -> data/raw/appstore-reviews.json`);
