"use client";
import { motion } from "framer-motion";
import { ProductImage } from "@/components/ProductImage";
import { QuantitySelector } from "@/components/cart/QuantitySelector";
import type { ResolvedLine } from "@/lib/cart";

/**
 * One row in the drawer: image, name, unit price, stepper, line total.
 *
 * `layout` slides the remaining rows up when one is removed. There is no exit
 * animation: presence-based exits do not unmount in this app, which would leave
 * removed products visible in the cart — a correctness bug, not a missing
 * flourish. React removes the row immediately and the neighbours animate closed.
 */
export function CartItem({
  line,
  onQtyChange,
}: {
  line: ResolvedLine;
  onQtyChange: (qty: number) => void;
}) {
  const { product, qty, lineTotal } = line;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-center gap-3 py-2.5">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line">
          <ProductImage product={product} sizes="48px" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-tight">{product.name}</p>
          <p className="text-[11px] text-muted">
            ₹{product.price_inr} × {qty}
          </p>
        </div>

        <QuantitySelector qty={qty} onChange={onQtyChange} label={product.name} size="sm" />

        <span className="w-14 shrink-0 text-right text-[13px] font-bold tabular-nums">
          ₹{lineTotal}
        </span>
      </div>
    </motion.li>
  );
}
