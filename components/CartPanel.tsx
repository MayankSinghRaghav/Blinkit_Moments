"use client";
import { ProductImage } from "@/components/ProductImage";
import { byId } from "@/lib/data/catalog";
import { setDemo, useDemo } from "@/lib/session";

const CONTEXTS = ["Fri 7pm", "rainy evening, monsoon", "first-time buyer", "Tue 9am, no signal"];

export function CartPanel({ children }: { children?: React.ReactNode }) {
  const demo = useDemo();
  const items = demo.cart.map(byId).filter((p) => p !== undefined);
  const total = items.reduce((s, p) => s + p.price_inr, 0);

  return (
    <aside className="lg:sticky lg:top-[124px] lg:h-fit">
      <div className="rounded-xl border border-line">
        <div className="flex items-baseline gap-2 border-b border-line px-4 py-3">
          <h2 className="text-sm font-bold">My cart</h2>
          <span className="text-xs text-muted">{items.length} items</span>
          <span className="ml-auto text-sm font-bold tabular-nums">₹{total}</span>
        </div>

        {items.length ? (
          <ul className="max-h-72 overflow-y-auto px-2 py-1">
            {items.map((p) => (
              <li key={p.id} className="flex items-center gap-2 py-2">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-line">
                  <ProductImage product={p} sizes="44px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-tight">{p.name}</p>
                  <p className="text-[11px] text-muted">{p.category}</p>
                </div>
                <span className="text-[13px] tabular-nums">₹{p.price_inr}</span>
                <button
                  onClick={() => setDemo({ cart: demo.cart.filter((id) => id !== p.id) })}
                  aria-label={`Remove ${p.name}`}
                  className="rounded px-1.5 py-1 text-xs text-black/30 hover:bg-tile hover:text-black"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-sm text-black/40">
            Cart is empty. Add something and the agent will read the occasion.
          </p>
        )}
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
