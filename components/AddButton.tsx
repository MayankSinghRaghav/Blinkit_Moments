"use client";
import { tryItem } from "@/lib/actions";
import { useDemo } from "@/lib/session";

export function AddButton({ productId }: { productId: string }) {
  const demo = useDemo();
  const added = demo.cart.includes(productId);
  return (
    <button
      onClick={() => tryItem(demo, productId)}
      disabled={added}
      className={`w-full rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wide ${
        added ? "bg-tile text-black/35" : "bg-brand text-white hover:bg-brand-dark"
      }`}
    >
      {added ? "In your basket" : "Add to basket"}
    </button>
  );
}
