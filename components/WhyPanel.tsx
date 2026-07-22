import type { Product } from "@/lib/data/catalog";
import { isHighConsideration } from "@/lib/data/catalog";

export function WhyPanel({
  product,
  occasionLabel,
  like,
  stretch,
}: {
  product: Product;
  occasionLabel: string;
  like: string;
  stretch: string;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-black/10 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-black/40">Why now</h2>
        <p className="mt-1 text-sm">{like}</p>
      </section>

      {isHighConsideration(product.category) && (
        <section className="rounded-xl border border-black/10 bg-white p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-black/40">Why trust it</h2>
          <ul className="mt-1 space-y-1 text-sm">
            {product.rating && (
              <li>
                ★ {product.rating} from {product.reviews?.toLocaleString("en-IN")} buyers
              </li>
            )}
            {product.proof && <li>{product.proof}</li>}
            {product.starter && (
              <li className="text-brand">
                Starter pack — ₹{product.price_inr}, the smallest size we sell. Try it once for{" "}
                {occasionLabel.toLowerCase()}, skip it if it doesn&apos;t land.
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-black/10 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-black/40">
          Why it&apos;s a stretch
        </h2>
        <p className="mt-1 text-sm text-black/60">{stretch}</p>
      </section>
    </div>
  );
}
