"use client";
import Link from "next/link";
import { CartPanel } from "@/components/CartPanel";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/data/catalog";
import { setDemo } from "@/lib/session";
import { useOccasion } from "@/lib/useOccasion";

export default function ShopPage() {
  const { demo, data, loading } = useOccasion("infer-occasion");
  const sensed = data && data.occasion_id !== "none";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        {sensed && (
          <Link
            href="/moments"
            className="mb-5 flex items-center gap-4 rounded-xl bg-accent px-5 py-4 transition hover:brightness-[1.03]"
          >
            <span className="text-2xl" aria-hidden>
              ✨
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">
                Looks like {data.occasion_label} · {Math.round(data.confidence * 100)}% sure
              </span>
              <span className="block text-sm text-black/70">
                {data.suggestions.length} things you&apos;ve never ordered would finish it off
              </span>
            </span>
            <span className="ml-auto shrink-0 rounded-lg bg-black/85 px-3 py-2 text-xs font-bold text-white">
              Complete it →
            </span>
          </Link>
        )}

        {!loading && data && !sensed && (
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
                    added={demo.cart.includes(p.id)}
                    onAdd={() => setDemo({ cart: [...demo.cart, p.id] })}
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
