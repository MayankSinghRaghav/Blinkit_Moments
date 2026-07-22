/**
 * Pushes the seeded catalog + occasions into Supabase.
 * No-op (with a note) when Supabase isn't configured — the app reads these from
 * lib/data anyway; the tables exist so adoption_events can reference them.
 *   npm run db:seed
 */
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS } from "@/lib/data/catalog";
import { OCCASIONS } from "@/lib/occasions";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log("Supabase not configured — nothing to seed. App runs on lib/data + in-memory store.");
  process.exit(0);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const products = PRODUCTS.map(({ id, name, category, price_inr, tags, starter }) => ({
  id,
  name,
  category,
  price_inr,
  tags,
  starter: Boolean(starter),
}));

const occasions = OCCASIONS.map((o) => ({
  id: o.id,
  label: o.label,
  signal_tags: [...o.signal_categories, ...o.signal_keywords],
  target_categories: o.target_categories,
}));

async function push(table: string, rows: object[]) {
  const { error } = await db.from(table).upsert(rows);
  if (error) {
    console.error(`${table}: ${error.message}`);
    process.exit(1);
  }
  console.log(`${table}: ${rows.length} rows`);
}

// wrapped, not top-level await — tsx transpiles this file as CJS
push("products", products).then(() => push("occasions", occasions));
