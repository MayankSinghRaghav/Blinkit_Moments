"use client";
import { motion } from "framer-motion";

/**
 * Sticky footer of the drawer: item count, grand total, and the checkout CTA.
 * The total keys off its own value so it re-animates whenever it changes.
 */
export function CartSummary({
  itemCount,
  total,
  onCheckout,
}: {
  itemCount: number;
  total: number;
  onCheckout: () => void;
}) {
  return (
    <div className="border-t border-line bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
      <div className="mb-3 flex items-baseline justify-between text-sm">
        <span className="text-muted">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>
        <motion.span
          key={total}
          initial={{ opacity: 0.4, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="text-base font-extrabold tabular-nums"
        >
          ₹{total}
        </motion.span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="w-full rounded-xl bg-brand px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition active:scale-[0.98] hover:bg-brand-dark"
      >
        Continue Checkout
      </button>
    </div>
  );
}
