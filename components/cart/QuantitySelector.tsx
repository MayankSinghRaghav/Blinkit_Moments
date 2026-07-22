"use client";
/**
 * Blinkit-style stepper: a solid green pill with − / + either side of the count.
 * Controlled — it owns no state, so it can't drift from the cart.
 *
 * The count slides in on change via a keyed remount and a CSS keyframe. Two
 * things this avoids: <AnimatePresence> exits were not removing children here,
 * which stacked every previous number over the current one; and a JS-driven
 * opacity animation leaves the digit invisible if it never runs (it doesn't
 * under prefers-reduced-motion). Its resting state is visible, so it degrades.
 */
export function QuantitySelector({
  qty,
  onChange,
  label,
  size = "md",
}: {
  qty: number;
  onChange: (qty: number) => void;
  /** what's being counted, for screen readers */
  label: string;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm";

  return (
    <div
      className="inline-flex items-center rounded-lg bg-brand font-bold text-white"
      role="group"
      aria-label={`Quantity for ${label}`}
    >
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        aria-label={qty === 1 ? `Remove ${label}` : `Decrease ${label}`}
        className={`${pad} rounded-l-lg leading-none transition active:scale-90 hover:bg-brand-dark`}
      >
        −
      </button>

      {/* fixed width so the pill doesn't jump between 9 and 10 */}
      <span className="relative h-5 w-7 overflow-hidden" aria-live="polite" aria-atomic>
        <span
          key={qty}
          className="qty-in absolute inset-0 flex items-center justify-center tabular-nums"
        >
          {qty}
        </span>
      </span>

      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        aria-label={`Increase ${label}`}
        className={`${pad} rounded-r-lg leading-none transition active:scale-90 hover:bg-brand-dark`}
      >
        +
      </button>
    </div>
  );
}
