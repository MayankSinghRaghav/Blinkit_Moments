"use client";
import { useEffect, useRef } from "react";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { resolve, setQty, type CartLine } from "@/lib/cart";

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Bottom sheet. Always mounted and slid off-screen when closed, rather than
 * conditionally rendered: presence-based unmounting proved unreliable here, and
 * a sheet that never unmounts would never run its cleanup — leaving the page
 * scroll-locked and a stale aria-modal dialog in the tree.
 *
 * Position is a CSS transform, not a JS animation. Under
 * prefers-reduced-motion the JS tween never runs, which left the sheet parked
 * off-screen even when open — the cart was unreachable for those users. A CSS
 * class always applies; only the transition between states is suppressed.
 *
 * Because it stays mounted, everything that must be off when closed is driven
 * by `open` explicitly: scroll lock, Escape, focus trap, pointer events, and
 * visibility to assistive tech.
 */
export function CartDrawer({
  open,
  lines,
  onChange,
  onClose,
  onCheckout,
}: {
  open: boolean;
  lines: CartLine[];
  onChange: (lines: CartLine[]) => void;
  onClose: () => void;
  onCheckout: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    returnFocus.current = document.activeElement as HTMLElement;
    const t = setTimeout(() => {
      panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, 60);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      returnFocus.current?.focus();
    };
  }, [open, onClose]);

  const resolved = resolve(lines);
  const itemCount = resolved.reduce((n, l) => n + l.qty, 0);
  const total = resolved.reduce((s, l) => s + l.lineTotal, 0);

  return (
    <div
      // `inert` keeps the closed sheet out of the tab order and away from
      // screen readers without unmounting it
      inert={!open}
      aria-hidden={!open}
      role="dialog"
      aria-modal={open}
      aria-label="Your cart"
      ref={panel}
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,.18)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
        open ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="flex min-h-0 flex-col">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span aria-hidden>🛒</span>
          <h2 className="text-sm font-bold">Your cart</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="ml-auto rounded-lg px-2 py-1 text-black/40 transition hover:bg-tile hover:text-black"
          >
            ✕
          </button>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto px-4">
          {resolved.map((line) => (
            <CartItem
              key={line.product.id}
              line={line}
              onQtyChange={(qty) => onChange(setQty(lines, line.product.id, qty))}
            />
          ))}
        </ul>

        <CartSummary itemCount={itemCount} total={total} onCheckout={onCheckout} />
      </div>
    </div>
  );
}
