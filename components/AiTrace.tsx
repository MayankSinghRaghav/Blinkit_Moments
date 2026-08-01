"use client";
import { byId } from "@/lib/data/catalog";
import { occasionById } from "@/lib/occasions";
import type { OccasionResult, OccasionSource } from "@/lib/useOccasion";
import type { CartLine } from "@/lib/cart";

/**
 * User-facing reasoning trace. The engine already decides everything the panel
 * shows — occasion, confidence, which path produced it, the guardrail that
 * dropped in-basket categories — so this just exposes it instead of hiding it
 * in /api/health. Borrowed from the reference MVP's "Developer & Evaluator AI
 * Trace", but every field here is real: no scripted persona, no invented
 * review counts. Collapsed by default so it never competes with the kit.
 */
const PATH: Record<OccasionSource, string> = {
  llm: "gemini-2.5-flash · live model",
  cache: "gemini-2.5-flash · cached",
  rules: "deterministic matcher · fallback",
};

export function AiTrace({
  data,
  cart,
  context,
}: {
  data: OccasionResult;
  cart: CartLine[];
  context: string;
}) {
  const sensed = data.occasion_id !== "none";
  const trace = {
    input: {
      basket: cart
        .map((l) => ({ p: byId(l.id), qty: l.qty }))
        .filter((x) => x.p)
        .map((x) => `${x.p!.name} ×${x.qty}`),
      context: context || "(none)",
    },
    occasion_inference: {
      occasion_id: data.occasion_id,
      label: data.occasion_label,
      // the one thing the rules structurally cannot do: name an occasion
      // outside the seeded set
      vocabulary: sensed ? (occasionById(data.occasion_id) ? "seeded" : "open") : "n/a",
      confidence: Number(data.confidence.toFixed(2)),
    },
    engine: {
      source: PATH[data.source],
      grounding: "suggestions validated against live catalog",
      guardrail: "excludes categories already in the basket",
    },
    suggestions: data.suggestions.map((s) => ({
      product_id: s.product_id,
      category: s.category,
    })),
    decision: sensed ? "SURFACE_OCCASION_KIT" : "STAY_SILENT",
  };

  return (
    <details className="mt-4 overflow-hidden rounded-xl border border-line bg-[#0d1117] text-[#c9d1d9]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white/90">
        <span
          className={`h-1.5 w-1.5 rounded-full ${data.degraded ? "bg-amber-400" : "bg-emerald-400"}`}
          aria-hidden
        />
        AI reasoning trace
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/70">
          {data.source}
        </span>
        <span className="ml-auto text-[11px] font-normal text-white/40">why the engine chose this</span>
      </summary>
      <pre className="overflow-x-auto border-t border-white/10 px-4 py-3 text-[11.5px] leading-relaxed">
        <code>{JSON.stringify(trace, null, 2)}</code>
      </pre>
    </details>
  );
}
