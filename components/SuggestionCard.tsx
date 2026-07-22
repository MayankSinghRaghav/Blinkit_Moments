"use client";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { byId } from "@/lib/data/catalog";
import type { Suggestion } from "@/lib/scoring";

export function SuggestionCard({
  suggestion,
  occasionId,
  qty,
  onQtyChange,
}: {
  suggestion: Suggestion;
  occasionId: string;
  qty: number;
  onQtyChange: (qty: number) => void;
}) {
  const p = byId(suggestion.product_id);
  if (!p) return null;
  return (
    <ProductCard
      product={p}
      qty={qty}
      onQtyChange={onQtyChange}
      badge={
        <span className="absolute left-1.5 top-1.5 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          New · {p.category}
        </span>
      }
    >
      <p className="mt-1.5 text-[12px] leading-snug text-black/60">{suggestion.why_now}</p>
      {suggestion.confidence && (
        <p className="mt-1.5 rounded-md bg-brand/8 px-2 py-1 text-[11px] leading-snug text-brand">
          ✓ {suggestion.confidence}
        </p>
      )}
      <Link
        href={`/why/${p.id}?o=${occasionId}`}
        className="mt-1.5 text-[11px] text-black/40 underline underline-offset-2 hover:text-black"
      >
        Why this?
      </Link>
    </ProductCard>
  );
}
