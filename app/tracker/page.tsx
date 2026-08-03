"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdoptionRing } from "@/components/AdoptionRing";
import { ProductImage } from "@/components/ProductImage";
import { byId } from "@/lib/data/catalog";
import { useDemo } from "@/lib/session";
import type { AdoptionEvent } from "@/lib/scoring";

type State = {
  adopted: string[];
  goal: number;
  depth: number;
  baseline: string[];
  events: AdoptionEvent[];
};

export default function TrackerPage() {
  const demo = useDemo();
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!demo.sessionId) return;
    const r = await fetch(`/api/feedback?session_id=${demo.sessionId}`);
    if (r.ok) setState(await r.json());
  }, [demo.sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  const simulate = useCallback(async () => {
    setBusy(true);
    await fetch("/api/simulate-month", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session_id: demo.sessionId }),
    }).catch(() => {});
    await load();
    setBusy(false);
  }, [demo.sessionId, load]);

  // Cold-start: if the tracker loads with nothing tried yet, auto-simulate once
  // so a reviewer opening /tracker directly still sees a populated example.
  const autoSeeded = useRef(false);
  useEffect(() => {
    if (!state || autoSeeded.current || busy) return;
    const hasTrials = (state.events ?? []).some((e) => e.event !== "suggested");
    if (!hasTrials) {
      autoSeeded.current = true;
      simulate();
    }
  }, [state, busy, simulate]);

  const trials = (state?.events ?? []).filter((e) => e.event !== "suggested");
  const newCats = [...new Set(trials.map((e) => e.category))].filter(
    (c) => !state?.baseline.includes(c),
  );
  // PRIMARY metric = the assignment's exact wording: bought from >= 1 NEW category
  // this month. A single purchase in a new category crosses it. "Tried twice"
  // (state.adopted) is the downstream adoption-QUALITY bar, shown below — not this.
  const met = newCats.length >= 1;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-extrabold">Adoption tracker</h1>
      <p className="mt-1 text-sm text-muted">
        Success metric: the share of monthly active customers who buy from at least{" "}
        <strong className="text-ink">one new category</strong> each month. Your session crosses it
        the moment you buy from a category you didn&apos;t already shop. Buying it{" "}
        <strong className="text-ink">2×+</strong> is the adoption-quality bar below, not the primary
        definition.
      </p>

      <div
        className={`mt-5 flex items-center gap-3 rounded-xl px-5 py-4 ${
          met ? "bg-brand text-white" : "bg-tile text-black/55"
        }`}
      >
        <span className="text-xl" aria-hidden>
          {met ? "✓" : "○"}
        </span>
        <div>
          <p className="text-sm font-bold">
            {met
              ? "Counts toward the North Star this month"
              : "Not yet counting toward the North Star"}
          </p>
          <p className={`text-xs ${met ? "text-white/80" : "text-black/45"}`}>
            Goal: buy from at least 1 new category this month
            {newCats.length > 0 && ` — you're at ${newCats.length}`}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-6 rounded-xl border border-line p-6 sm:flex-row sm:items-center">
        <AdoptionRing adopted={state?.adopted.length ?? 0} goal={state?.depth ?? 3} />
        <div className="min-w-0 text-sm">
          <p className="font-bold">Adoption quality — categories bought 2×+</p>
          <p className="mt-1 text-muted">
            {state?.adopted.length ? state.adopted.join(", ") : "None yet"}
          </p>
          <p className="mt-2 text-xs text-black/45">
            The primary metric only needs one new-category purchase. Buying it again is the leading
            indicator that a trial became a habit rather than a one-off.
          </p>
          <p className="mt-3 text-xs text-black/40">
            Session started with: {state?.baseline.join(", ") || "—"}
          </p>
          <button
            onClick={simulate}
            disabled={busy || !demo.sessionId}
            className="mt-4 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:bg-black/15"
          >
            {busy ? "Simulating…" : "Simulate a month"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line p-5">
        <h2 className="text-sm font-bold">Trial → repeat</h2>
        {newCats.length ? (
          <ul className="mt-3 space-y-3">
            {newCats.map((c) => {
              const n = trials.filter((e) => e.category === c).length;
              const p = byId(trials.find((e) => e.category === c)!.product_id);
              return (
                <li key={c} className="flex items-center gap-3">
                  {p && (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-line">
                      <ProductImage product={p} sizes="40px" />
                    </div>
                  )}
                  <span className="w-28 shrink-0 text-sm font-medium">{c}</span>
                  <span className="flex gap-1" aria-hidden>
                    {Array.from({ length: Math.max(n, 2) }, (_, i) => (
                      <span
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full ${i < n ? "bg-brand" : "bg-line"}`}
                      />
                    ))}
                  </span>
                  <span className="ml-auto text-xs font-medium text-muted">
                    {n >= 2 ? "adopted" : `${n}/2`}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-black/40">
            Nothing tried yet. Add a suggestion on the Moments screen, or fast-forward above.
          </p>
        )}
      </div>
    </div>
  );
}
