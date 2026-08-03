"use client";
import Link from "next/link";
import { CartPanel } from "@/components/CartPanel";
import { ProductCard } from "@/components/ProductCard";
import { SourceBadge } from "@/components/SourceBadge";
import { CATEGORIES, PRODUCTS } from "@/lib/data/catalog";
import { setDemo } from "@/lib/session";
import { qtyOf, setQty } from "@/lib/cart";
import { useOccasion } from "@/lib/useOccasion";

export default function ShopPage() {
  const { demo, data } = useOccasion("infer-occasion");
  const sensed = data.occasion_id !== "none";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        {sensed && (
          <div className="mb-5 rounded-xl bg-accent px-5 py-4">
            <Link href="/moments" className="flex items-center gap-4 transition hover:brightness-[1.03]">
              <span className="text-2xl" aria-hidden>
                ✨
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 text-sm font-bold">
                  Looks like {data.occasion_label} · {Math.round(data.confidence * 100)}% sure
                  <SourceBadge source={data.source} />
                </span>
                <span className="block text-sm text-black/70">
                  {data.suggestions.length} things you&apos;ve never ordered would finish it off
                </span>
              </span>
              <span className="ml-auto shrink-0 rounded-lg bg-black/85 px-3 py-2 text-xs font-bold text-white">
                Complete it →
              </span>
            </Link>
            {data.reason && (
              <details className="mt-2 border-t border-black/10 pt-2">
                <summary className="cursor-pointer text-xs font-medium text-black/50 hover:text-black">
                  Why?
                </summary>
                <p className="mt-1 text-[13px] italic text-black/60">{data.reason}</p>
              </details>
            )}
          </div>
        )}

        {!sensed && (
          <p className="mb-5 rounded-xl border border-dashed border-line px-5 py-4 text-sm text-black/45">
            No clear occasion behind this basket — we&apos;d rather stay quiet than guess.
          </p>
        )}

        {CATEGORIES.map((category) => {
          const items = PRODUCTS.filter((p) => p.category === category);
          if (!items.length) return null;
          return (
            <section key={category} className="mb-7">
              <h2 className="mb-3 text-base font-bold">{category}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    qty={qtyOf(demo.cart, p.id)}
                    onQtyChange={(q) => setDemo({ cart: setQty(demo.cart, p.id, q) })}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <CartPanel />
    </div>
  );
}
