import Link from "next/link";
import { notFound } from "next/navigation";
import { AddButton } from "@/components/AddButton";
import { ProductImage } from "@/components/ProductImage";
import { WhyPanel } from "@/components/WhyPanel";
import { byId } from "@/lib/data/catalog";
import { explain } from "@/lib/llm";
import { occasionById } from "@/lib/occasions";

export const dynamic = "force-dynamic";

export default async function WhyPage({
  params,
  searchParams,
}: {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ o?: string }>;
}) {
  const { itemId } = await params;
  const { o } = await searchParams;
  const product = byId(itemId);
  if (!product) notFound();

  const occasionLabel = (o && occasionById(o)?.label) || "this moment";
  const { why_you_ll_like_it, why_its_a_stretch, degraded } = await explain(product.id, occasionLabel);

  return (
    <div>
      <Link
        href="/moments"
        className="text-sm text-black/45 underline underline-offset-2 hover:text-black"
      >
        ← Back to moments
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="lg:sticky lg:top-[124px] lg:h-fit">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-line">
            <ProductImage product={product} sizes="380px" />
            <span className="absolute left-3 top-3 rounded-md bg-brand px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              New for you · {product.category}
            </span>
          </div>
          <div className="mt-4 hidden lg:block">
            <AddButton productId={product.id} />
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold leading-tight">{product.name}</h1>
          <p className="mt-1 text-sm text-muted">
            ₹{product.price_inr} · suggested for {occasionLabel.toLowerCase()}
          </p>

          <div className="mt-6">
            <WhyPanel
              product={product}
              occasionLabel={occasionLabel}
              like={why_you_ll_like_it}
              stretch={why_its_a_stretch}
            />
          </div>

          <div className="mt-6 lg:hidden">
            <AddButton productId={product.id} />
          </div>

          {degraded && (
            <p className="mt-6 text-xs text-black/35">
              Written from the product and occasion only — no AI quota available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
