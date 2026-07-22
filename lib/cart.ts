import { byId, type Product } from "@/lib/data/catalog";

/** One line in the cart. Quantity lives here, not in a parallel map. */
export type CartLine = { id: string; qty: number };

export type ResolvedLine = { product: Product; qty: number; lineTotal: number };

/**
 * Cart used to be `string[]`. Old sessions still have that in localStorage, so
 * accept either shape and normalise. Unknown ids are dropped — the catalog is
 * the authority on what exists.
 */
export function toLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const lines: CartLine[] = [];
  for (const entry of raw) {
    if (typeof entry === "string") {
      lines.push({ id: entry, qty: 1 });
    } else if (entry && typeof entry === "object" && "id" in entry) {
      const { id, qty } = entry as CartLine;
      if (typeof id === "string" && Number.isFinite(qty) && qty > 0) {
        lines.push({ id, qty: Math.floor(qty) });
      }
    }
  }
  // collapse any duplicate ids a legacy cart might contain
  const merged = new Map<string, number>();
  for (const l of lines) merged.set(l.id, (merged.get(l.id) ?? 0) + l.qty);
  return [...merged].filter(([id]) => byId(id)).map(([id, qty]) => ({ id, qty }));
}

/** Resolve to products, skipping ids no longer in the catalog. */
export function resolve(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((l) => {
    const product = byId(l.id);
    return product ? [{ product, qty: l.qty, lineTotal: product.price_inr * l.qty }] : [];
  });
}

export const countItems = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);

export const totalPrice = (lines: CartLine[]) =>
  resolve(lines).reduce((sum, l) => sum + l.lineTotal, 0);

export const inCart = (lines: CartLine[], id: string) => lines.some((l) => l.id === id);

export const qtyOf = (lines: CartLine[], id: string) => lines.find((l) => l.id === id)?.qty ?? 0;

/** Set a quantity; 0 or less removes the line. Appends if not present. */
export function setQty(lines: CartLine[], id: string, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((l) => l.id !== id);
  if (!inCart(lines, id)) return [...lines, { id, qty }];
  return lines.map((l) => (l.id === id ? { ...l, qty } : l));
}

export const addOne = (lines: CartLine[], id: string) => setQty(lines, id, qtyOf(lines, id) + 1);

/** Distinct categories in the cart — what the occasion engine reads. */
export const categoriesIn = (lines: CartLine[]) => [
  ...new Set(resolve(lines).map((l) => l.product.category)),
];
