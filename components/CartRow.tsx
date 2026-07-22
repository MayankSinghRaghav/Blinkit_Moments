"use client";
import type { Product } from "@/lib/data/catalog";

export function CartRow({ product, onRemove }: { product: Product; onRemove: () => void }) {
  return (
    <li className="flex items-center gap-3 border-b border-black/5 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-xs text-black/50">{product.category}</p>
      </div>
      <span className="text-sm tabular-nums">₹{product.price_inr}</span>
      <button
        onClick={onRemove}
        aria-label={`Remove ${product.name}`}
        className="rounded px-2 py-1 text-xs text-black/40 hover:bg-black/5 hover:text-black"
      >
        ✕
      </button>
    </li>
  );
}
