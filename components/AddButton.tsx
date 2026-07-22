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
      className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:bg-black/20"
    >
      {added ? "In your basket" : "Add to basket"}
    </button>
  );
}
