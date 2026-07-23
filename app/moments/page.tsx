"use client";
import Link from "next/link";
import { CartPanel } from "@/components/CartPanel";
import { SuggestionCard } from "@/components/SuggestionCard";
import { dismissItem, setSuggestionQty } from "@/lib/actions";
import { qtyOf } from "@/lib/cart";
import { useOccasion } from "@/lib/useOccasion";

export default function MomentsPage() {
  const { demo, data, refining } = useOccasion("complete");
  // a dismissed suggestion never comes back this session — showing it again is
  // exactly the behaviour Nikhil described as "obviously trying to sell me more"
  const visible = data.suggestions.filter((s) => !demo.dismissed.includes(s.product_id));
  const sensed = data.occasion_id !== "none" && visible.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <div className="rounded-xl bg-accent px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-black/50">
            Occasion sensed from your cart
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-extrabold">
            {sensed ? data.occasion_label : "No clear occasion yet"}
            {refining && (
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black/50">
                refining
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-black/70">
            {sensed
              ? `${Math.round(data.confidence * 100)}% confidence · completing across ${visible.length} ${visible.length === 1 ? "category" : "categories"} you've never ordered`
              : "Add a couple of items and the agent will read the basket."}
          </p>
        </div>

        {data?.degraded && (
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
            Running on the built-in occasion matcher (AI quota unavailable). Suggestions are still
            real, just less nuanced.
          </p>
        )}

        {sensed && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((s) => (
              <SuggestionCard
                key={s.product_id}
                suggestion={s}
                occasionId={data.occasion_id}
                qty={qtyOf(demo.cart, s.product_id)}
                onQtyChange={(q) => setSuggestionQty(demo, s.product_id, q)}
                onDismiss={() => dismissItem(demo, s.product_id)}
              />
            ))}
          </div>
        )}

        {!sensed && (
          <p className="mt-5 rounded-xl border border-dashed border-line px-5 py-6 text-sm text-black/45">
            Nothing to complete.{" "}
            <Link href="/" className="text-brand underline underline-offset-2">
              Back to the shop
            </Link>
          </p>
        )}

        <Link
          href="/tracker"
          className="mt-6 inline-block text-sm font-medium text-brand underline underline-offset-2"
        >
          See what actually stuck →
        </Link>
      </div>

      <CartPanel />
    </div>
  );
}
