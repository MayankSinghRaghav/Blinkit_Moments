"use client";
import { addOne, setQty, type CartLine } from "@/lib/cart";
import { setDemo } from "@/lib/session";

type Ctx = { sessionId: string; cart: CartLine[]; occasionId: string };

/** Log a trial of a suggested item — this is what drives the adoption tracker. */
async function logTrial(ctx: Ctx, productId: string) {
  await fetch("/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      session_id: ctx.sessionId,
      product_id: productId,
      event: "tried",
      occasion_id: ctx.occasionId || undefined,
    }),
  }).catch(() => {});
}

/** Add a suggested item to the cart and record the trial. */
export async function tryItem(ctx: Ctx, productId: string) {
  setDemo({ cart: addOne(ctx.cart, productId) });
  await logTrial(ctx, productId);
}

/**
 * Quantity change on a suggestion card. Only the first 0 -> n transition counts
 * as a trial; bumping 2 -> 3 must not inflate the adoption metric.
 */
export async function setSuggestionQty(ctx: Ctx, productId: string, qty: number) {
  const wasInCart = ctx.cart.some((l) => l.id === productId);
  setDemo({ cart: setQty(ctx.cart, productId, qty) });
  if (!wasInCart && qty > 0) await logTrial(ctx, productId);
}
