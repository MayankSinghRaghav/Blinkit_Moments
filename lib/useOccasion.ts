"use client";
import { useEffect, useState } from "react";
import { resolve } from "@/lib/cart";
import type { CompleteResult } from "@/lib/scoring";
import { setDemo, useDemo } from "@/lib/session";

export type OccasionState = (CompleteResult & { degraded: boolean }) | null;

/** Calls the occasion engine whenever the cart, context, or comfort dial changes. */
export function useOccasion(endpoint: "infer-occasion" | "complete") {
  const demo = useDemo();
  const [data, setData] = useState<OccasionState>(null);
  const [loading, setLoading] = useState(true);
  const { sessionId, cart, comfort, context } = demo;
  // ids only: changing a quantity must not spend an LLM call
  const cartKey = cart.map((l) => l.id).join(",");

  useEffect(() => {
    if (!sessionId) return;
    const ac = new AbortController();
    setLoading(true);
    // the comfort slider fires on every tick — don't spend an LLM call per pixel
    const t = setTimeout(() => {
      fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({
          session_id: sessionId,
          // built from cartKey, not cart, so the effect has no stale-closure
          // dependency on the array identity
          basket: resolve(cartKey.split(",").filter(Boolean).map((id) => ({ id, qty: 1 }))).map(
            ({ product }) => ({
              product_id: product.id,
              name: product.name,
              category: product.category,
            }),
          ),
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
    }, 400);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [endpoint, sessionId, cartKey, context, comfort]);

  return { demo, data, loading };
}
