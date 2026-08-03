import type { OccasionSource } from "@/lib/useOccasion";

/**
 * Honest provenance label. "AI inference" only when the LLM (or its cache)
 * produced the result; "rule-based fallback" only when the deterministic
 * matcher ran. Never claims AI for a fallback.
 */
export function SourceBadge({ source }: { source: OccasionSource }) {
  const ai = source === "llm" || source === "cache";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        ai ? "bg-brand/12 text-brand" : "bg-amber-100 text-amber-800"
      }`}
      title={ai ? "Inferred by the Gemini occasion model" : "Deterministic matcher (AI unavailable)"}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ai ? "bg-brand" : "bg-amber-500"}`} aria-hidden />
      {ai ? "AI inference" : "rule-based fallback"}
    </span>
  );
}
