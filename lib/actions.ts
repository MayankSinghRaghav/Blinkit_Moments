"use client";
import { setDemo } from "@/lib/session";

/** Add a suggested item to the cart and log the trial that drives the tracker. */
export async function tryItem(
  demo: { sessionId: string; cart: string[]; occasionId: string },
  productId: string,
) {
  if (!demo.cart.includes(productId)) setDemo({ cart: [...demo.cart, productId] });
  await fetch("/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      session_id: demo.sessionId,
      product_id: productId,
      event: "tried",
      occasion_id: demo.occasionId || undefined,
    }),
  }).catch(() => {});
}
