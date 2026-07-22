"use client";
import { useEffect, useState } from "react";
import { byId } from "@/lib/data/catalog";
import type { CompleteResult } from "@/lib/scoring";
import { setDemo, useDemo } from "@/lib/session";

export type OccasionState = (CompleteResult & { degraded: boolean }) | null;

/** Calls the occasion engine whenever the cart, context, or comfort dial changes. */
export function useOccasion(endpoint: "infer-occasion" | "complete") {
  const demo = useDemo();
  const [data, setData] = useState<OccasionState>(null);
  const [loading, setLoading] = useState(true);
  const { sessionId, cart, comfort, context } = demo;
  const cartKey = cart.join(",");

  useEffect(() => {
    if (!sessionId) return;
    const ac = new AbortController();
    setLoading(true);
    fetch(`/api/${endpoint}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ac.signal,
      body: JSON.stringify({
        session_id: sessionId,
        basket: cartKey
          .split(",")
          .filter(Boolean)
          .map((id) => byId(id))
          .filter((p) => p !== undefined)
          .map((p) => ({ product_id: p.id, name: p.name, category: p.category })),
        context,
        comfort,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((r: OccasionState) => {
        setData(r);
        if (r) setDemo({ occasionId: r.occasion_id, occasionLabel: r.occasion_label });
      })
      .catch(() => {})
      .finally(() => !ac.signal.aborted && setLoading(false));
    return () => ac.abort();
  }, [endpoint, sessionId, cartKey, context, comfort]);

  return { demo, data, loading };
}
