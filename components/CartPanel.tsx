"use client";
import { countItems, totalPrice, type CartLine } from "@/lib/cart";
import { setDemo, useDemo } from "@/lib/session";

/**
 * Demo scenarios — the reference MVP's persona switcher, adapted to occasions.
 * Each preset swaps the whole basket AND the context and lets the engine
 * re-infer live, so an evaluator sees it respond without hand-building a cart.
 * The last one is the honest no-signal case: the engine stays quiet.
 */
type Scenario = { label: string; emoji: string; cart: CartLine[]; context: string };
const SCENARIOS: Scenario[] = [
  { label: "Game night", emoji: "🎮", context: "Fri 7pm", cart: [{ id: "bev_beer", qty: 1 }, { id: "snk_nachos", qty: 2 }] },
  { label: "Guests over", emoji: "🍽️", context: "hosting a few people tonight", cart: [{ id: "bev_beer", qty: 1 }, { id: "snk_chips", qty: 1 }] },
  { label: "Movie night", emoji: "🍿", context: "movie night on netflix", cart: [{ id: "snk_chips", qty: 1 }] },
  { label: "New puppy", emoji: "🐶", context: "first-time buyer", cart: [{ id: "pet_treats", qty: 1 }] },
  { label: "Just milk", emoji: "🥛", context: "Tue 9am", cart: [{ id: "gro_milk", qty: 1 }] },
];

const keyOf = (cart: CartLine[], context: string) =>
  cart.map((l) => l.id).sort().join(",") + "|" + context;

/**
 * Desktop sidebar. The cart itself now lives in the floating cart / drawer, so
 * this only shows a summary and the demo controls — two editable cart surfaces
 * on one screen would be confusing even though they share state.
 */
export function CartPanel({ children }: { children?: React.ReactNode }) {
  const demo = useDemo();
  const items = countItems(demo.cart);
  const activeKey = keyOf(demo.cart, demo.context);

  return (
    <aside className="lg:sticky lg:top-[124px] lg:h-fit">
      <div className="flex items-baseline gap-2 rounded-xl border border-line px-4 py-3">
        <h2 className="text-sm font-bold">My cart</h2>
        <span className="text-xs text-muted">
          {items} item{items === 1 ? "" : "s"}
        </span>
        <span className="ml-auto text-sm font-bold tabular-nums">₹{totalPrice(demo.cart)}</span>
      </div>

      <div className="mt-4 rounded-xl border border-line p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Try a scenario</p>
        <p className="mt-1 text-[11px] leading-snug text-black/45">
          Each preset swaps the basket and context, then re-runs the engine live.
        </p>
        <div className="mt-3 flex flex-col gap-1.5">
          {SCENARIOS.map((s) => {
            const active = keyOf(s.cart, s.context) === activeKey;
            return (
              <button
                key={s.label}
                // reset dismissals so a fresh scenario starts clean
                onClick={() => setDemo({ cart: s.cart, context: s.context, dismissed: [] })}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[12px] transition ${
                  active
                    ? "border-brand bg-brand/10 font-semibold text-brand"
                    : "border-line text-black/65 hover:border-black/25"
                }`}
              >
                <span aria-hidden>{s.emoji}</span>
                <span>{s.label}</span>
                <span className="ml-auto truncate text-[10.5px] font-normal text-black/35">
                  {s.context}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {children}
    </aside>
  );
}
