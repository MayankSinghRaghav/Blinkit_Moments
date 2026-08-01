import "server-only";

export type LLMSource = "llm" | "cache" | "rules";

export type InferenceTrace = {
  source: LLMSource;
  occasion_id: string;
  latency_ms: number;
  degraded: boolean;
  suggestions: number;
  /** true when the model named an occasion outside the seeded six */
  open_vocab?: boolean;
};

// ponytail: per-instance in-memory, resets on cold start — the durable record is
// the structured log line below, which Vercel/any log drain greps. These
// counters are just a convenience snapshot for /api/health. Swap for a real sink
// (Logtail/Datadog) only when traffic makes cross-instance aggregation matter.
const counters = { llm: 0, cache: 0, rules: 0, degraded: 0, open_vocab: 0, total: 0, latency_sum: 0 };

/** One structured line per inference — source, latency, and what it decided. */
export function traceInference(e: InferenceTrace): void {
  counters.total++;
  counters[e.source]++;
  if (e.degraded) counters.degraded++;
  if (e.open_vocab) counters.open_vocab++;
  counters.latency_sum += e.latency_ms;
  console.log(JSON.stringify({ evt: "occasion_inference", ...e }));
}

export function inferenceStats() {
  return {
    total: counters.total,
    by_source: { llm: counters.llm, cache: counters.cache, rules: counters.rules },
    degraded: counters.degraded,
    open_vocab: counters.open_vocab,
    avg_latency_ms: counters.total ? Math.round(counters.latency_sum / counters.total) : 0,
  };
}
