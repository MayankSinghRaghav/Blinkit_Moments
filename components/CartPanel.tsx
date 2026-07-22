"use client";
import { countItems, totalPrice } from "@/lib/cart";
import { setDemo, useDemo } from "@/lib/session";

const CONTEXTS = ["Fri 7pm", "rainy evening, monsoon", "first-time buyer", "Tue 9am, no signal"];

/**
 * Desktop sidebar. The cart itself now lives in the floating cart / drawer, so
 * this only shows a summary and the demo controls — two editable cart surfaces
 * on one screen would be confusing even though they share state.
 */
export function CartPanel({ children }: { children?: React.ReactNode }) {
  const demo = useDemo();
  const items = countItems(demo.cart);

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
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Simulated context</p>
        <p className="mt-1 text-[11px] leading-snug text-black/45">
          Stands in for time, day and weather signals the real app would already have.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CONTEXTS.map((c) => (
            <button
              key={c}
              onClick={() => setDemo({ context: c })}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                demo.context === c
                  ? "border-brand bg-brand text-white"
                  : "border-line text-black/60 hover:border-black/25"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {children}
    </aside>
  );
}
