"use client";
import { useState } from "react";
import type { Product } from "@/lib/data/catalog";

/**
 * Reviews block for the product page. Presentation only — no engine, no logic.
 *
 * HONESTY: the review text, avatars and photos are ILLUSTRATIVE sample content,
 * generated deterministically from the product id and clearly labelled as such.
 * The star average / count reuse the product's own real `rating`/`reviews`
 * fields where present.
 */
type SampleReview = {
  name: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
  photo: boolean;
};

const POOL: SampleReview[] = [
  { name: "Aditi R.", rating: 5, title: "Exactly as described", body: "Arrived fast and sealed. Quality was better than I expected for the price.", date: "12 Jul 2025", helpful: 34, photo: true },
  { name: "Rahul M.", rating: 4, title: "Good, minor niggle", body: "Does the job well. Packaging could be a bit sturdier but no damage this time.", date: "2 Jul 2025", helpful: 18, photo: false },
  { name: "Sneha K.", rating: 5, title: "Repeat buyer", body: "Third order of this. Consistent every time, which is why I keep coming back.", date: "28 Jun 2025", helpful: 27, photo: false },
  { name: "Imran S.", rating: 2, title: "Not for me", body: "Fine product but smaller than the photo suggested. Manage your expectations on size.", date: "19 Jun 2025", helpful: 9, photo: true },
  { name: "Priya D.", rating: 4, title: "Solid value", body: "Cheaper than my local store and delivered in minutes. Would recommend for a first try.", date: "10 Jun 2025", helpful: 15, photo: false },
  { name: "Karan V.", rating: 1, title: "Disappointed", body: "One unit was past its best. Support sorted a refund quickly though, so not all bad.", date: "3 Jun 2025", helpful: 6, photo: false },
];

const PROS = ["Great value", "Fast delivery", "As described", "Good quality"];
const CONS = ["Size runs small", "Packaging could improve"];

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
const AVATAR_BG = ["#0072B2", "#009E73", "#D55E00", "#CC79A7", "#E69F00", "#56B4E9"];

function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`tabular-nums text-brand ${className}`} aria-label={`${n} out of 5`}>
      {"★".repeat(Math.round(n))}
      <span className="text-black/20">{"★".repeat(5 - Math.round(n))}</span>
    </span>
  );
}

export function Reviews({ product }: { product: Product }) {
  const [filter, setFilter] = useState<"all" | "positive" | "critical" | "photos">("all");
  const h = Math.abs(hash(product.id));

  const avg = product.rating ?? 4.2 + (h % 7) / 10;
  const count = product.reviews ?? 40 + (h % 900);
  // pick 4 sample reviews for this product, deterministic
  const reviews = [...POOL].sort((a, b) => ((hash(product.id + a.name) - hash(product.id + b.name)))).slice(0, 4);

  // distribution skewed toward the average (illustrative)
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const closeness = Math.max(0, 5 - Math.abs(star - avg));
    return { star, pct: Math.round((closeness / 12) * 100) + (star === Math.round(avg) ? 30 : 3) };
  });
  const distMax = Math.max(...dist.map((d) => d.pct));

  const shown = reviews.filter((r) =>
    filter === "all" ? true : filter === "positive" ? r.rating >= 4 : filter === "critical" ? r.rating <= 2 : r.photo,
  );

  return (
    <section className="rounded-xl border border-line p-5">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold">Ratings &amp; reviews</h2>
        <span className="rounded-full bg-tile px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black/45">
          sample content
        </span>
      </div>

      {/* summary + distribution */}
      <div className="mt-4 grid gap-5 sm:grid-cols-[160px_1fr]">
        <div className="text-center sm:text-left">
          <p className="text-4xl font-extrabold tabular-nums">{avg.toFixed(1)}</p>
          <Stars n={avg} className="text-lg" />
          <p className="mt-1 text-xs text-black/45">{count.toLocaleString("en-IN")} ratings</p>
        </div>
        <ul className="space-y-1.5">
          {dist.map((d) => (
            <li key={d.star} className="grid grid-cols-[16px_1fr_32px] items-center gap-2">
              <span className="text-[11px] tabular-nums text-black/55">{d.star}★</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-tile">
                <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.round((d.pct / distMax) * 100)}%` }} />
              </span>
              <span className="text-right text-[11px] tabular-nums text-black/40">{d.pct}%</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI summary */}
      <div className="mt-4 rounded-lg bg-brand/[0.05] p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-brand">✨ AI review summary · sample</p>
        <p className="mt-1 text-[13px] leading-snug text-black/70">
          Buyers consistently praise fast delivery and value; the main recurring critique is that the
          pack size can feel smaller than expected. Repeat-purchase intent is high.
        </p>
      </div>

      {/* pros / cons */}
      <div className="mt-3 flex flex-wrap gap-4 text-[12px]">
        <div>
          <p className="font-semibold text-emerald-700">What people like</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {PROS.map((p) => (
              <li key={p} className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800">👍 {p}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-amber-700">Watch-outs</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {CONS.map((c) => (
              <li key={c} className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">👎 {c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* filters */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {(["all", "positive", "critical", "photos"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium capitalize transition ${
              filter === f ? "border-brand bg-brand text-white" : "border-line text-black/55 hover:border-black/25"
            }`}
          >
            {f === "photos" ? "With photos" : f}
          </button>
        ))}
      </div>

      {/* review list */}
      <ul className="mt-3 divide-y divide-line">
        {shown.map((r, i) => (
          <li key={i} className="py-3">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: AVATAR_BG[hash(product.id + r.name) % AVATAR_BG.length] || "#0072B2" }}
                aria-hidden
              >
                {r.name.split(" ").map((w) => w[0]).join("")}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold leading-tight">
                  {r.name}
                  <span className="rounded bg-emerald-50 px-1 py-0.5 text-[9px] font-bold uppercase text-emerald-700">✓ verified</span>
                </p>
                <p className="text-[11px] text-black/40">{r.date}</p>
              </div>
              <Stars n={r.rating} className="ml-auto text-sm" />
            </div>
            <p className="mt-1.5 text-[13px] font-semibold">{r.title}</p>
            <p className="text-[13px] leading-snug text-black/65">{r.body}</p>
            {r.photo && (
              <div className="mt-2 flex gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-brand/15 to-tile text-[9px] text-black/40" aria-hidden>
                  photo
                </div>
              </div>
            )}
            <button className="mt-1.5 text-[11px] text-black/45 hover:text-black">👍 Helpful ({r.helpful})</button>
          </li>
        ))}
        {!shown.length && <li className="py-4 text-sm text-black/40">No sample reviews match this filter.</li>}
      </ul>
    </section>
  );
}
