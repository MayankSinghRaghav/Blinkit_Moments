"use client";
import { useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { countItems, totalPrice, type CartLine } from "@/lib/cart";
import { setDemo, useDemo } from "@/lib/session";

/**
 * The single cart surface, mounted once in the root layout so it rides every
 * screen. Reads and writes the existing demo store — it holds no cart state of
 * its own beyond whether the sheet is open.
 *
 * Pill and sheet are both permanently mounted and moved with CSS transforms.
 * Two earlier attempts used <AnimatePresence> (and a shared `layoutId` morph);
 * presence children never unmounted here, which stacked stale nodes and left
 * the sheet's scroll-lock cleanup permanently un-run. A JS tween then proved
 * worse still: under prefers-reduced-motion it never runs, so anything whose
 * visibility depended on it simply never appeared. CSS classes always apply.
 *
 * The pill sinks and fades as the sheet rises from the same edge, so it still
 * reads as one shape becoming the other.
 */
export function FloatingCart() {
  const demo = useDemo();
  const [open, setOpen] = useState(false);

  const lines = demo.cart;
  const itemCount = countItems(lines);
  const total = totalPrice(lines);
  const showPill = itemCount > 0 && !open;

  const update = (next: CartLine[]) => {
    setDemo({ cart: next });
    if (next.length === 0) setOpen(false); // nothing left to show
  };

  return (
    <>
      <div
        inert={!showPill}
        aria-hidden={!showPill}
        className={`fixed inset-x-0 bottom-4 z-40 mx-auto w-fit px-4 transition-all duration-300 ease-out motion-reduce:transition-none ${
          showPill
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-24 scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open cart, ${itemCount} items, ₹${total}`}
          className="flex items-center gap-3 rounded-2xl bg-brand px-5 py-3 text-white shadow-[0_6px_24px_rgba(12,131,31,.4)] transition active:scale-95"
        >
          <span className="text-lg" aria-hidden>
            🛒
          </span>
          <span className="text-left leading-tight">
            <span className="block text-[11px] font-medium text-white/80">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>
            <span className="block text-sm font-extrabold tabular-nums">₹{total}</span>
          </span>
          <span className="ml-1 text-xs font-bold uppercase tracking-wide">View cart ›</span>
        </button>
      </div>

      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <CartDrawer
        open={open}
        lines={lines}
        onChange={update}
        onClose={() => setOpen(false)}
        onCheckout={() => setOpen(false)}
      />
    </>
  );
}
