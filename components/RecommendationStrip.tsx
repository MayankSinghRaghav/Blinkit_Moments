"use client";
import { ProductCard } from "@/components/ProductCard";
import { setDemo, useDemo } from "@/lib/session";
import { qtyOf, setQty } from "@/lib/cart";
import type { Product } from "@/lib/data/catalog";

/**
 * Horizontal product strip. Presentation only. The items are a transparent
 * catalog slice (e.g. same category) chosen server-side and labelled honestly as
 * browse — this is NOT the AI occasion recommender (that lives on /moments and
 * is untouched). No ranking/affinity logic here.
 */
export function RecommendationStrip({
  title,
  note,
  products,
}: {
  title: string;
  note?: string;
  products: Product[];
}) {
  const demo = useDemo();
  if (!products.length) return null;
  return (
    <section>
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-bold">{title}</h2>
        {note && <span className="text-xs text-black/40">{note}</span>}
      </div>
      <div className="no-bar mt-3 flex gap-3 overflow-x-auto pb-1">
        {products.map((p) => (
          <div key={p.id} className="w-[150px] shrink-0">
            <ProductCard
              product={p}
              qty={qtyOf(demo.cart, p.id)}
              onQtyChange={(q) => setDemo({ cart: setQty(demo.cart, p.id, q) })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
