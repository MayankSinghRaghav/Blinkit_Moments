/**
 * Pulls a real packshot for each catalog product from the Open Food Facts family
 * of open databases (ODbL data / CC-BY-SA images) into public/products/<id>.jpg,
 * and records provenance in public/products/attribution.json.
 *
 *   node scripts/fetch-images.mjs          # only missing images
 *   node scripts/fetch-images.mjs --force  # refetch everything
 *
 * Products with no usable match are left out; the UI falls back to a tinted
 * category tile, so the grid never shows a broken image.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "products");
const UA = "blinkit-moments-demo/0.1 (prototype; contact via github.com/MayankSinghRaghav)";
const force = process.argv.includes("--force");

const DB = {
  off: "world.openfoodfacts.org",
  obf: "world.openbeautyfacts.org",
  opff: "world.openpetfoodfacts.org",
  opf: "world.openproductsfacts.org",
};

// product id -> [database, search term]
const QUERIES = {
  bev_beer: ["off", "beer lager"],
  bev_cola: ["off", "coca cola"],
  bev_juice: ["off", "mixed fruit juice"],
  bev_ginger_tea: ["off", "masala chai tea"],
  bev_cold_brew: ["off", "cold brew coffee"],

  snk_nachos: ["off", "doritos nacho cheese"],
  snk_chips: ["off", "lays magic masala"],
  snk_dip: ["off", "salsa dip"],
  snk_noodles: ["off", "maggi noodles"],
  snk_pakora: ["off", "pakora mix"],

  hom_plates: ["opf", "paper plates"],
  hom_napkins: ["opf", "paper napkins"],
  hom_trash: ["opf", "garbage bags"],
  hom_floor: ["opf", "floor cleaner"],
  hom_diya: ["opf", "tealight candles"],

  des_choco_tub: ["off", "chocolate fudge ice cream"],
  des_icecream: ["off", "vanilla ice cream"],
  des_gulab: ["off", "gulab jamun"],
  des_brownie: ["off", "chocolate brownie"],

  mix_tonic: ["off", "tonic water"],
  mix_lime: ["off", "lime juice"],
  mix_soda: ["off", "club soda"],

  pet_treats: ["opff", "dog training treats"],
  pet_litter: ["opff", "cat litter"],
  pet_bowl: ["opff", "dog food bowl"],

  bab_wipes: ["opf", "baby wipes"],
  bab_diapers: ["opf", "baby diapers"],
  bab_lotion: ["obf", "baby lotion"],

  pc_facewash: ["obf", "face wash"],
  pc_handwash: ["obf", "hand wash"],
  pc_sanitizer: ["obf", "hand sanitizer"],

  wel_immunity: ["off", "immunity drink mix"],
  wel_protein: ["off", "whey protein"],
  wel_vitc: ["off", "vitamin c effervescent"],

  gro_milk: ["off", "amul milk"],
  gro_bread: ["off", "brown bread"],
  gro_eggs: ["off", "chicken eggs"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(db, term) {
  const url =
    `https://${DB[db]}/cgi/search.pl?search_terms=${encodeURIComponent(term)}` +
    `&json=1&page_size=8&fields=product_name,brands,image_front_small_url,code`;
  // the free API throttles hard with 503s — back off rather than give up
  let last = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt) await sleep(3000 * attempt);
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) {
        last = `search ${res.status}`;
        continue;
      }
      const { products = [] } = await res.json();
      return products.find((p) => p.image_front_small_url);
    } catch (e) {
      last = e.message;
    }
  }
  throw new Error(last || "search failed");
}

async function download(url) {
  // .200. is the thumbnail the search returns; .400. is the same shot, sharper
  const big = url.replace(/\.200\.jpg$/, ".400.jpg");
  for (const candidate of [big, url]) {
    const res = await fetch(candidate, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30_000) });
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    // guard against an HTML error page saved as .jpg
    if (buf.length > 1000 && buf[0] === 0xff && buf[1] === 0xd8) return { buf, src: candidate };
  }
  return null;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const attribPath = join(OUT, "attribution.json");
  const attrib = existsSync(attribPath) ? JSON.parse(readFileSync(attribPath, "utf8")) : {};

  let got = 0;
  const missing = [];

  for (const [id, [db, term]] of Object.entries(QUERIES)) {
    const file = join(OUT, `${id}.jpg`);
    if (!force && existsSync(file)) {
      got++;
      continue;
    }
    try {
      const hit = await search(db, term);
      if (!hit) throw new Error("no result with an image");
      const dl = await download(hit.image_front_small_url);
      if (!dl) throw new Error("image download failed");
      writeFileSync(file, dl.buf);
      attrib[id] = {
        source: DB[db],
        product: hit.product_name || null,
        brand: hit.brands || null,
        code: hit.code || null,
        image: dl.src,
        licence: "Images CC-BY-SA, data ODbL — Open Food Facts contributors",
      };
      got++;
      console.log(`  ok    ${id.padEnd(16)} ${(hit.brands || "").slice(0, 18).padEnd(18)} ${Math.round(dl.buf.length / 1024)}kb`);
    } catch (e) {
      missing.push(id);
      console.log(`  MISS  ${id.padEnd(16)} ${e.message}`);
    }
    await sleep(600); // be polite to a free community API
  }

  writeFileSync(attribPath, JSON.stringify(attrib, null, 2));
  console.log(`\n${got}/${Object.keys(QUERIES).length} images present`);
  if (missing.length) console.log(`no image (will use a category tile): ${missing.join(", ")}`);
}

main();
