"use client";
import { ProductImage } from "@/components/ProductImage";
import { QuantitySelector } from "@/components/cart/QuantitySelector";
import type { Product } from "@/lib/data/catalog";

/**
 * Grid tile. Like Blinkit, the ADD button is replaced in place by the quantity
 * stepper once the item is in the cart — same component the drawer uses, so the
 * two can't drift apart.
 */
export function ProductCard({
  product,
  qty,
  onQtyChange,
  badge,
  children,
}: {
  product: Product;
  qty: number;
  onQtyChange: (qty: number) => void;
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
      {product.starter && <p className="mt-0.5 text-[11px] font-medium text-brand">Starter pack</p>}

      {children}

      <div className="mt-auto flex items-center gap-2 pt-2">
        <span className="text-sm font-bold tabular-nums">₹{product.price_inr}</span>
        <span className="ml-auto">
          {qty > 0 ? (
            <QuantitySelector qty={qty} onChange={onQtyChange} label={product.name} size="sm" />
          ) : (
            <button
              type="button"
              onClick={() => onQtyChange(1)}
              aria-label={`Add ${product.name}`}
              className="rounded-lg border border-brand bg-brand/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-brand transition active:scale-95 hover:bg-brand hover:text-white"
            >
              Add
            </button>
          )}
        </span>
      </div>
    </article>
  );
}
