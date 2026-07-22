"use client";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/lib/data/catalog";

export function ProductCard({
  product,
  added,
  onAdd,
  badge,
  children,
}: {
  product: Product;
  added: boolean;
  onAdd: () => void;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-line p-2.5 transition hover:shadow-[0_4px_14px_rgba(0,0,0,.08)]">
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-white">
        <ProductImage product={product} sizes="(min-width:1024px) 200px, 45vw" />
        {badge}
      </div>

      <p className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-tight">
        {product.name}
      </p>
      {product.starter && (
        <p className="mt-0.5 text-[11px] font-medium text-brand">Starter pack</p>
      )}

      {children}

      <div className="mt-auto flex items-center gap-2 pt-2">
        <span className="text-sm font-bold tabular-nums">₹{product.price_inr}</span>
        <button
          onClick={onAdd}
          disabled={added}
          className={`ml-auto rounded-lg border px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
            added
              ? "border-line bg-tile text-black/35"
              : "border-brand bg-brand/5 text-brand hover:bg-brand hover:text-white"
          }`}
        >
          {added ? "Added" : "Add"}
        </button>
      </div>
    </article>
  );
}
