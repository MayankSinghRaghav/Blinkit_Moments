import type { Product } from "@/lib/data/catalog";
import { isHighConsideration } from "@/lib/data/catalog";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-1.5 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

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
    <div className="space-y-3">
      <Section title="Why now">{like}</Section>

      {isHighConsideration(product.category) && (
        <Section title="Why trust it">
          <ul className="space-y-1.5">
            {product.rating && (
              <li className="flex items-center gap-2">
                <span className="rounded bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white">
                  ★ {product.rating}
                </span>
                <span className="text-black/60">
                  from {product.reviews?.toLocaleString("en-IN")} buyers
                </span>
              </li>
            )}
            {product.proof && <li className="text-black/60">{product.proof}</li>}
            {product.starter && (
              <li className="text-brand">
                Starter pack — ₹{product.price_inr}, the smallest size we sell. Try it once for{" "}
                {occasionLabel.toLowerCase()}, skip it if it doesn&apos;t land.
              </li>
            )}
          </ul>
        </Section>
      )}

      <Section title="Why it's a stretch">
        <span className="text-black/60">{stretch}</span>
      </Section>
    </div>
  );
}
