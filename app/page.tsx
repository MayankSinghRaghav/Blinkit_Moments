"use client";
import Link from "next/link";
import { CartPanel } from "@/components/CartPanel";
import { ProductCard } from "@/components/ProductCard";
import { SourceBadge } from "@/components/SourceBadge";
import { CATEGORIES, PRODUCTS } from "@/lib/data/catalog";
import { CATEGORY_ICON, catAnchor } from "@/lib/category-meta";
import { setDemo } from "@/lib/session";
import { qtyOf, setQty } from "@/lib/cart";
import { useSearch, setSearch } from "@/lib/search";
import { useOccasion } from "@/lib/useOccasion";

export default function ShopPage() {
  const { demo, data } = useOccasion("infer-occasion");
  const sensed = data.occasion_id !== "none";

  const q = useSearch().trim().toLowerCase();
  const searching = q.length > 0;
  // match every query token against name + category + tags + id (ids encode the
  // common noun: bev_beer → "beer", snk_chips → "chips", pet_treats → "treats")
  const tokens = q.split(/\s+/).filter(Boolean);
  const haystack = (p: (typeof PRODUCTS)[number]) =>
    `${p.name} ${p.category} ${p.tags.join(" ")} ${p.id.replace(/_/g, " ")}`.toLowerCase();
  const matches = searching ? PRODUCTS.filter((p) => tokens.every((t) => haystack(p).includes(t))) : [];

  const cardFor = (p: (typeof PRODUCTS)[number]) => (
    <ProductCard
      key={p.id}
      product={p}
      qty={qtyOf(demo.cart, p.id)}
      onQtyChange={(qn) => setDemo({ cart: setQty(demo.cart, p.id, qn) })}
    />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        {/* ---------- search results ---------- */}
        {searching ? (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <h1 className="text-base font-bold">
                {matches.length} result{matches.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
              </h1>
              <button
                onClick={() => setSearch("")}
                className="ml-auto text-xs font-medium text-brand underline underline-offset-2"
              >
                Clear
              </button>
            </div>
            {matches.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {matches.map(cardFor)}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-line px-5 py-10 text-center text-sm text-black/45">
                Nothing matches &ldquo;{q}&rdquo;. Try &ldquo;beer&rdquo;, &ldquo;chips&rdquo; or a
                category name.
              </p>
            )}
          </section>
        ) : (
          <>
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

            {/* ---------- category chip row ---------- */}
            <div className="no-bar mb-6 flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((c) => (
                <Link
                  key={c}
                  href={`#${catAnchor(c)}`}
                  className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-line px-3 py-2 text-center transition hover:border-brand/40 hover:bg-accent"
                >
                  <span className="text-xl" aria-hidden>
                    {CATEGORY_ICON[c]}
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-black/70">{c}</span>
                </Link>
              ))}
            </div>

            {/* ---------- catalog by category ---------- */}
            {CATEGORIES.map((category) => {
              const items = PRODUCTS.filter((p) => p.category === category);
              if (!items.length) return null;
              return (
                <section key={category} id={catAnchor(category)} className="mb-7 scroll-mt-32">
                  <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
                    <span className="text-lg" aria-hidden>
                      {CATEGORY_ICON[category]}
                    </span>
                    {category}
                    <span className="text-xs font-normal text-black/40">{items.length}</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    {items.map(cardFor)}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>

      <CartPanel />
    </div>
  );
}
