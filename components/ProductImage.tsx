import Image from "next/image";
import attribution from "@/public/products/attribution.json";
import type { Product } from "@/lib/data/catalog";

const HAS_IMAGE = new Set(Object.keys(attribution));

/** First letter-ish glyph per category, for the two SKUs with no open packshot. */
const TILE: Record<string, string> = {
  Beverages: "🥤",
  Snacks: "🍿",
  Home: "🕯️",
  Desserts: "🍰",
  Mixers: "🍋",
  Pet: "🐾",
  Baby: "🍼",
  PersonalCare: "🧴",
  Wellness: "💊",
  Groceries: "🛒",
};

export function ProductImage({ product, sizes = "160px" }: { product: Product; sizes?: string }) {
  if (!HAS_IMAGE.has(product.id)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-tile text-3xl" aria-hidden>
        {TILE[product.category] ?? "🛒"}
      </div>
    );
  }
  return (
    <Image
      src={`/products/${product.id}.jpg`}
      alt={product.name}
      fill
      sizes={sizes}
      className="object-contain p-2 mix-blend-multiply"
    />
  );
}
