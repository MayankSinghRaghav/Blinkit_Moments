import Link from "next/link";
import { notFound } from "next/navigation";
import { AddButton } from "@/components/AddButton";
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
    <div className="space-y-5">
      <Link href="/moments" className="text-sm text-black/45 underline underline-offset-2">
        ← Back
      </Link>

      <div>
        <span className="inline-block rounded-full bg-accent/50 px-2 py-0.5 text-[11px] font-semibold">
          New for you · {product.category}
        </span>
        <h1 className="mt-2 text-lg font-semibold">{product.name}</h1>
        <p className="text-sm text-black/50">
          ₹{product.price_inr} · suggested for {occasionLabel.toLowerCase()}
        </p>
      </div>

      <WhyPanel
        product={product}
        occasionLabel={occasionLabel}
        like={why_you_ll_like_it}
        stretch={why_its_a_stretch}
      />

      <AddButton productId={product.id} />

      {degraded && (
        <p className="text-xs text-black/35">
          Written from the product and occasion only — no AI model configured.
        </p>
      )}
    </div>
  );
}
