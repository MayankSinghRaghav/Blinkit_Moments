"use client";
import { QuantitySelector } from "@/components/cart/QuantitySelector";
import { setSuggestionQty, tryItem } from "@/lib/actions";
import { qtyOf } from "@/lib/cart";
import { useDemo } from "@/lib/session";

/** Full-width add control on the product detail page. */
export function AddButton({ productId, label }: { productId: string; label: string }) {
  const demo = useDemo();
  const qty = qtyOf(demo.cart, productId);

  if (qty > 0) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5">
        <span className="text-sm font-medium">In your basket</span>
        <QuantitySelector
          qty={qty}
          onChange={(next) => setSuggestionQty(demo, productId, next)}
          label={label}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => tryItem(demo, productId)}
      className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition active:scale-[0.98] hover:bg-brand-dark"
    >
      Add to basket
    </button>
  );
}
