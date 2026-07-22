"use client";
import Link from "next/link";
import { CartPanel } from "@/components/CartPanel";
import { ComfortDial } from "@/components/ComfortDial";
import { SuggestionCard } from "@/components/SuggestionCard";
import { setDemo } from "@/lib/session";
import { tryItem } from "@/lib/actions";
import { useOccasion } from "@/lib/useOccasion";

export default function MomentsPage() {
  const { demo, data, loading } = useOccasion("complete");
  const sensed = data && data.occasion_id !== "none";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <div className="rounded-xl bg-accent px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-black/50">
            Occasion sensed from your cart
          </p>
          <h1 className="mt-1 text-xl font-extrabold">
            {sensed ? data.occasion_label : "No clear occasion yet"}
          </h1>
          <p className="mt-1 text-sm text-black/70">
            {sensed
              ? `${Math.round(data.confidence * 100)}% confidence · completing across ${data.suggestions.length} categories you've never ordered`
              : "Add a couple of items and the agent will read the basket."}
          </p>
        </div>

        {data?.degraded && (
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
            Running on the built-in occasion matcher (AI quota unavailable). Suggestions are still
            real, just less nuanced.
          </p>
        )}

        {loading && <p className="mt-6 text-sm text-black/40">Thinking…</p>}

        {!loading && sensed && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {data.suggestions.map((s) => (
              <SuggestionCard
                key={s.product_id}
                suggestion={s}
                occasionId={data.occasion_id}
                added={demo.cart.includes(s.product_id)}
                onAdd={() => tryItem(demo, s.product_id)}
              />
            ))}
          </div>
        )}

        {!loading && !sensed && (
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

      <CartPanel>
        <div className="mt-4">
          <ComfortDial value={demo.comfort} onChange={(comfort) => setDemo({ comfort })} />
        </div>
      </CartPanel>
    </div>
  );
}
