/**
 * Checks the adoption rule against whatever store is configured.
 *   npm run verify:store
 * With Supabase env vars set this proves durability in Postgres; without them it
 * exercises the same logic against the in-memory fallback.
 */
import { getSession, upsertSession, addEvents } from "@/lib/store";
import { adoptedCategories } from "@/lib/scoring";
import { supabaseConfigured } from "@/lib/supabase/admin";

const id = crypto.randomUUID();

async function main() {
  console.log("store:", supabaseConfigured() ? "supabase" : "in-memory");

  await upsertSession(id, { baseline: ["Beverages", "Snacks"] });
  await addEvents(id, [
    { product_id: "hom_napkins", category: "Home", event: "suggested", occasion_id: "game_night" },
    { product_id: "hom_napkins", category: "Home", event: "tried", occasion_id: "game_night" },
    { product_id: "hom_napkins", category: "Home", event: "repeat", occasion_id: "game_night" },
    { product_id: "des_brownie", category: "Desserts", event: "tried", occasion_id: "game_night" },
    // baseline category — two trials, but must NOT count as adoption
    { product_id: "bev_cola", category: "Beverages", event: "tried", occasion_id: "game_night" },
    { product_id: "bev_cola", category: "Beverages", event: "repeat", occasion_id: "game_night" },
  ]);

  const s = await getSession(id);
  const adopted = adoptedCategories(s.baseline, s.events);

  console.log("baseline :", s.baseline);
  console.log("events   :", s.events.length);
  console.log("adopted  :", adopted);

  const checks: [string, boolean][] = [
    ["6 events round-tripped", s.events.length === 6],
    ["baseline round-tripped", s.baseline.join() === "Beverages,Snacks"],
    ["Home adopted (tried+repeat)", adopted.includes("Home")],
    ["Desserts not adopted (1 trial)", !adopted.includes("Desserts")],
    ["Beverages not adopted (baseline)", !adopted.includes("Beverages")],
    ["'suggested' alone doesn't count", adopted.length === 1],
  ];

  console.log();
  for (const [name, ok] of checks) console.log(`  ${ok ? "pass" : "FAIL"}  ${name}`);
  const failed = checks.filter(([, ok]) => !ok).length;
  console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
  process.exit(failed ? 1 : 0);
}

main();
