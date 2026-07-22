/**
 * Checks the cart maths and the legacy-shape migration.
 *   npm run verify:cart
 * The cart changed from string[] to {id,qty}[]; anyone with an old session in
 * localStorage must still land on a working cart.
 */
import {
  addOne,
  categoriesIn,
  countItems,
  inCart,
  qtyOf,
  resolve,
  setQty,
  toLines,
  totalPrice,
  type CartLine,
} from "@/lib/cart";
import { byId } from "@/lib/data/catalog";

const beer = byId("bev_beer")!.price_inr;
const nachos = byId("snk_nachos")!.price_inr;

const checks: [string, boolean][] = [];
const check = (name: string, ok: boolean) => checks.push([name, ok]);

// migration from the old string[] shape
const legacy = toLines(["bev_beer", "snk_nachos", "bev_beer"]);
check("legacy string[] migrates", legacy.length === 2);
check("legacy duplicates collapse into qty", qtyOf(legacy, "bev_beer") === 2);

// unknown ids must not survive — the catalog is the authority
check("unknown id dropped", toLines(["not_a_product"]).length === 0);
check("garbage input is empty, not a crash", toLines("nonsense").length === 0);
check("zero/negative qty rejected", toLines([{ id: "bev_beer", qty: 0 }]).length === 0);

// arithmetic
const cart: CartLine[] = [
  { id: "bev_beer", qty: 2 },
  { id: "snk_nachos", qty: 3 },
];
check("countItems sums quantities, not lines", countItems(cart) === 5);
check("totalPrice multiplies by qty", totalPrice(cart) === beer * 2 + nachos * 3);
check("lineTotal per row", resolve(cart)[0].lineTotal === beer * 2);

// mutations are immutable and correct
check("addOne increments", qtyOf(addOne(cart, "bev_beer"), "bev_beer") === 3);
check("addOne appends when absent", inCart(addOne(cart, "hom_napkins"), "hom_napkins"));
check("setQty to 0 removes the line", !inCart(setQty(cart, "bev_beer", 0), "bev_beer"));
check("original array not mutated", qtyOf(cart, "bev_beer") === 2);

check("categoriesIn dedupes", categoriesIn(cart).join() === "Beverages,Snacks");
check("empty cart totals zero", countItems([]) === 0 && totalPrice([]) === 0);

for (const [name, ok] of checks) console.log(`  ${ok ? "pass" : "FAIL"}  ${name}`);
const failed = checks.filter(([, ok]) => !ok).length;
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
