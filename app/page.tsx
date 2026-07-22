"use client";
import Link from "next/link";
import { CartRow } from "@/components/CartRow";
import { PRODUCTS, byId } from "@/lib/data/catalog";
import { setDemo } from "@/lib/session";
import { useOccasion } from "@/lib/useOccasion";

const CONTEXTS = ["Fri 7pm", "rainy evening, monsoon", "first-time buyer", "Tue 9am, no signal"];

export default function CartPage() {
  const { demo, data, loading } = useOccasion("infer-occasion");
  const items = demo.cart.map(byId).filter((p) => p !== undefined);
  const total = items.reduce((s, p) => s + p.price_inr, 0);
  const sensed = data && data.occasion_id !== "none";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Your cart</h1>
        <p className="text-sm text-black/50">
          {items.length} item{items.length === 1 ? "" : "s"} · ₹{total}
        </p>
      </div>

      <div className="rounded-xl border border-black/10 bg-white px-4">
        {items.length ? (
          <ul>
            {items.map((p) => (
              <CartRow
                key={p.id}
                product={p}
                onRemove={() => setDemo({ cart: demo.cart.filter((id) => id !== p.id) })}
              />
            ))}
          </ul>
        ) : (
          <p className="py-6 text-sm text-black/40">Empty. Add something below.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="add" className="text-sm text-black/60">
          Add item
        </label>
        <select
          id="add"
          value=""
          onChange={(e) => e.target.value && setDemo({ cart: [...demo.cart, e.target.value] })}
          className="rounded-lg border border-black/15 bg-white px-2 py-1.5 text-sm"
        >
          <option value="">Choose…</option>
          {PRODUCTS.filter((p) => !demo.cart.includes(p.id)).map((p) => (
            <option key={p.id} value={p.id}>
              {p.category} — {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-black/60">Context</span>
        {CONTEXTS.map((c) => (
          <button
            key={c}
            onClick={() => setDemo({ context: c })}
            className={`rounded-full border px-3 py-1 text-xs ${
              demo.context === c ? "border-brand bg-brand text-white" : "border-black/15 bg-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-black/40">Reading the basket…</p>}

      {!loading && sensed && (
        <Link
          href="/moments"
          className="block rounded-xl border border-black/10 bg-accent p-4 transition hover:brightness-105"
        >
          <p className="text-sm font-semibold">
            Looks like <span className="underline decoration-2">{data.occasion_label}</span>
          </p>
          <p className="mt-1 text-sm text-black/70">
            {Math.round(data.confidence * 100)}% sure. We found {data.suggestions.length} things
            you&apos;ve never ordered that would finish it off →
          </p>
        </Link>
      )}

      {!loading && data && !sensed && (
        <p className="rounded-xl border border-dashed border-black/15 p-4 text-sm text-black/45">
          No clear occasion behind this basket yet — we&apos;d rather stay quiet than guess.
        </p>
      )}
    </div>
  );
}
