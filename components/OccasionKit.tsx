"use client";
import { useState } from "react";
import { ProductImage } from "@/components/ProductImage";
import { byId } from "@/lib/data/catalog";
import type { Suggestion } from "@/lib/scoring";

/**
 * The occasion kit — the opt-out completion mechanic.
 *
 * A habit-locked shopper won't work through a list of suggestions deciding on
 * each (survey: 92% arrive knowing what they want; Nikhil: "not ten"). So the
 * kit inverts the default: everything the occasion needs is pre-selected, the
 * user swipes away what they don't want, and commits the rest in one tap.
 * Discovery with zero required decisions.
 */
export function OccasionKit({
  occasionLabel,
  gapLine,
  suggestions,
  inCart,
  onRemove,
  onAddKit,
  onWhy,
}: {
  occasionLabel: string;
  gapLine: string;
  suggestions: Suggestion[];
  inCart: (id: string) => boolean;
  onRemove: (id: string) => void;
  onAddKit: (ids: string[]) => void;
  onWhy: (id: string) => string;
}) {
  const items = suggestions
    .map((s) => ({ s, p: byId(s.product_id) }))
    .filter((x): x is { s: Suggestion; p: NonNullable<ReturnType<typeof byId>> } => Boolean(x.p));

  // items still to add (kept, not already in cart)
  const toAdd = items.filter((x) => !inCart(x.p.id));
  const total = toAdd.reduce((sum, x) => sum + x.p.price_inr, 0);
  const [added, setAdded] = useState(false);

  const commit = () => {
    onAddKit(toAdd.map((x) => x.p.id));
    setAdded(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-brand/30 bg-white shadow-[0_4px_20px_rgba(12,131,31,.08)]">
      <div className="flex items-center gap-2 bg-brand px-4 py-2.5 text-white">
        <span aria-hidden>✨</span>
        <span className="text-sm font-bold">The {occasionLabel} kit</span>
        <span className="ml-auto text-[11px] font-medium text-white/80">
          {items.length} new {items.length === 1 ? "category" : "categories"}, pre-selected
        </span>
      </div>

      {gapLine && (
        <p className="border-b border-line px-4 py-2.5 text-[13px] leading-snug text-black/70">
          {gapLine}
        </p>
      )}

      <ul className="divide-y divide-line">
        {items.map(({ s, p }) => {
          const done = inCart(p.id);
          return (
            <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-line">
                <ProductImage product={p} sizes="44px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-medium leading-tight">
                  <span className="truncate">{p.name}</span>
                  <span className="shrink-0 rounded bg-brand/10 px-1 py-0.5 text-[9px] font-bold uppercase text-brand">
                    {p.category}
                  </span>
                </p>
                <p className="text-[11px] leading-snug text-black/50">{s.why_now}</p>
              </div>
              <span className="shrink-0 text-[13px] font-bold tabular-nums">₹{p.price_inr}</span>
              {done ? (
                <span className="shrink-0 text-[11px] font-bold text-brand">✓ in cart</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  aria-label={`Remove ${p.name} from the kit`}
                  title="Not for me"
                  className="shrink-0 rounded-md px-1.5 py-1 text-xs text-black/30 transition hover:bg-black/5 hover:text-black"
                >
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-3 border-t border-line px-4 py-3">
        <a
          href="#why"
          onClick={(e) => {
            e.preventDefault();
            if (items[0]) window.location.href = onWhy(items[0].p.id);
          }}
          className="text-[12px] text-black/45 underline underline-offset-2 hover:text-black"
        >
          Why these?
        </a>
        <button
          type="button"
          onClick={commit}
          disabled={toAdd.length === 0}
          className={`ml-auto rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition active:scale-[0.98] ${
            toAdd.length === 0
              ? "bg-tile text-black/35"
              : "bg-brand text-white hover:bg-brand-dark"
          }`}
        >
          {toAdd.length === 0
            ? added
              ? "Kit added ✓"
              : "All in cart"
            : `Add ${toAdd.length === items.length ? "the kit" : `remaining ${toAdd.length}`} · ₹${total}`}
        </button>
      </div>
    </div>
  );
}
