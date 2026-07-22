"use client";
import Link from "next/link";
import { byId } from "@/lib/data/catalog";
import type { Suggestion } from "@/lib/scoring";

export function SuggestionCard({
  suggestion,
  occasionId,
  added,
  onAdd,
}: {
  suggestion: Suggestion;
  occasionId: string;
  added: boolean;
  onAdd: () => void;
}) {
  const p = byId(suggestion.product_id);
  if (!p) return null;
  return (
    <article className="rounded-xl border border-black/10 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-accent/50 px-2 py-0.5 text-[11px] font-semibold">
            New for you · {p.category}
          </span>
          <h3 className="mt-2 text-sm font-medium">{p.name}</h3>
          <p className="mt-1 text-sm text-black/60">{suggestion.why_now}</p>
          {suggestion.confidence && (
            <p className="mt-2 text-xs text-brand">✓ {suggestion.confidence}</p>
          )}
        </div>
        <span className="text-sm tabular-nums">₹{p.price_inr}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onAdd}
          disabled={added}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:bg-black/20"
        >
          {added ? "Added" : "Add"}
        </button>
        <Link
          href={`/why/${p.id}?o=${occasionId}`}
          className="text-sm text-black/50 underline underline-offset-2"
        >
          Why this?
        </Link>
      </div>
    </article>
  );
}
