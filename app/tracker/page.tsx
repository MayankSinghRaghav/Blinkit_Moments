"use client";
import { useCallback, useEffect, useState } from "react";
import { AdoptionRing } from "@/components/AdoptionRing";
import { byId } from "@/lib/data/catalog";
import { useDemo } from "@/lib/session";
import type { AdoptionEvent } from "@/lib/scoring";

type State = { adopted: string[]; goal: number; baseline: string[]; events: AdoptionEvent[] };

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

  async function simulate() {
    setBusy(true);
    await fetch("/api/simulate-month", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session_id: demo.sessionId }),
    }).catch(() => {});
    await load();
    setBusy(false);
  }

  const trials = (state?.events ?? []).filter((e) => e.event !== "suggested");
  const newCats = [...new Set(trials.map((e) => e.category))].filter(
    (c) => !state?.baseline.includes(c),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Adoption tracker</h1>
        <p className="text-sm text-black/50">
          A category counts once it&apos;s been tried twice — and you didn&apos;t already shop it.
        </p>
      </div>

      <div className="flex items-center gap-6 rounded-xl border border-black/10 bg-white p-5">
        <AdoptionRing adopted={state?.adopted.length ?? 0} goal={state?.goal ?? 3} />
        <div className="text-sm">
          <p className="font-medium">New categories adopted</p>
          <p className="mt-1 text-black/55">
            {state?.adopted.length ? state.adopted.join(", ") : "None yet"}
          </p>
          <p className="mt-3 text-xs text-black/40">
            Started with: {state?.baseline.join(", ") || "—"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-4">
        <h2 className="text-sm font-medium">Trial → repeat</h2>
        {newCats.length ? (
          <ul className="mt-2 space-y-1 text-sm">
            {newCats.map((c) => {
              const n = trials.filter((e) => e.category === c).length;
              return (
                <li key={c} className="flex items-center gap-2">
                  <span className="w-32 shrink-0">{c}</span>
                  <span className="text-black/40">{"●".repeat(Math.min(n, 5))}</span>
                  <span className="ml-auto text-xs text-black/45">
                    {n >= 2 ? "adopted" : `${n}/2`}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-black/40">
            Nothing tried yet. Add a suggestion on the Moments screen, or fast-forward below.
          </p>
        )}
      </div>

      <button
        onClick={simulate}
        disabled={busy || !demo.sessionId}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:bg-black/20"
      >
        {busy ? "Simulating…" : "Simulate a month"}
      </button>

      {trials.length > 0 && (
        <p className="text-xs text-black/40">
          Last tried: {byId(trials[trials.length - 1].product_id)?.name}
        </p>
      )}
    </div>
  );
}
