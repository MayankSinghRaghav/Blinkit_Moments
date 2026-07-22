"use client";
import Link from "next/link";
import { ComfortDial } from "@/components/ComfortDial";
import { SuggestionCard } from "@/components/SuggestionCard";
import { setDemo } from "@/lib/session";
import { tryItem } from "@/lib/actions";
import { useOccasion } from "@/lib/useOccasion";

export default function MomentsPage() {
  const { demo, data, loading } = useOccasion("complete");
  const sensed = data && data.occasion_id !== "none";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">
          {sensed ? `Complete your ${data.occasion_label.toLowerCase()}` : "Nothing to complete yet"}
        </h1>
        <p className="text-sm text-black/50">
          Only categories you&apos;ve never ordered. {sensed && `${Math.round(data.confidence * 100)}% confidence.`}
        </p>
      </div>

      <ComfortDial value={demo.comfort} onChange={(comfort) => setDemo({ comfort })} />

      {data?.degraded && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          Running on the built-in occasion matcher (AI model unavailable). Suggestions are still
          real, just less nuanced.
        </p>
      )}

      {loading && <p className="text-sm text-black/40">Thinking…</p>}

      {!loading && sensed && (
        <div className="space-y-3">
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
        <p className="rounded-xl border border-dashed border-black/15 p-4 text-sm text-black/45">
          Add a couple of items on the <Link href="/" className="underline">cart screen</Link> first.
        </p>
      )}

      <Link href="/tracker" className="inline-block text-sm text-brand underline underline-offset-2">
        See what actually stuck →
      </Link>
    </div>
  );
}
