"use client";
import { useEffect, useMemo, useState } from "react";
import { resolve, type CartLine } from "@/lib/cart";
import { completeOccasion, type CompleteResult } from "@/lib/scoring";
import { setDemo, useDemo } from "@/lib/session";

export type OccasionResult = CompleteResult & { degraded: boolean };

const basketFromKey = (key: string) =>
  resolve(
    key
      .split(",")
      .filter(Boolean)
      .map((id): CartLine => ({ id, qty: 1 })),
  ).map(({ product }) => ({
    product_id: product.id,
    name: product.name,
    category: product.category,
  }));

/**
 * Runs the occasion engine whenever the cart, context, or comfort dial changes.
 *
 * The deterministic matcher runs synchronously first and its result is shown
 * immediately; the server response replaces it when it lands. Two reasons:
 * a first paint of "No clear occasion yet" while the request is in flight reads
 * as the feature failing, and the seeded demo must resolve even if the request
 * is slow, quota-limited, or fails outright. Same function the API falls back
 * to, so this is one implementation shown twice, not two.
 */
export function useOccasion(endpoint: "infer-occasion" | "complete") {
  const demo = useDemo();
  const [server, setServer] = useState<OccasionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { sessionId, cart, comfort, context } = demo;
  // ids only: changing a quantity must not re-run inference
  const cartKey = cart.map((l) => l.id).join(",");

  const local = useMemo<OccasionResult>(
    () => ({ ...completeOccasion(basketFromKey(cartKey), context, comfort), degraded: true }),
    [cartKey, context, comfort],
  );

  useEffect(() => {
    if (!sessionId) return;
    const ac = new AbortController();
    // drop the previous answer so the local match for the NEW basket shows
    // instantly rather than the stale occasion for the old one
    setServer(null);
    setLoading(true);
    // the comfort slider fires on every tick — don't spend an LLM call per pixel
    const t = setTimeout(() => {
      fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({
          session_id: sessionId,
          basket: basketFromKey(cartKey),
          context,
          comfort,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((r: OccasionResult | null) => {
          if (r) setServer(r);
        })
        .catch(() => {
          // network failure just leaves the local match on screen
        })
        .finally(() => !ac.signal.aborted && setLoading(false));
    }, 400);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [endpoint, sessionId, cartKey, context, comfort]);

  const data = server ?? local;

  // keep the store in step for the /why deep links
  useEffect(() => {
    setDemo({ occasionId: data.occasion_id, occasionLabel: data.occasion_label });
  }, [data.occasion_id, data.occasion_label]);

  return { demo, data, loading, refining: loading && server === null };
}
