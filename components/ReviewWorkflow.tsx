"use client";
import { useState } from "react";

type Sentiment = "negative" | "neutral" | "positive";
type Theme = { label: string; count: number; sentiment: Sentiment; example: string };
type Analysis = { themes: Theme[]; tagged: number; source: "llm" | "rules" };

// Sample INPUT for the demo — realistic quick-commerce review lines a reviewer
// can run through the pipeline. Clearly sample input, not presented as findings.
const SAMPLE = [
  "The milk was delivered warm and had already curdled by the time it reached me.",
  "Super fast delivery, order arrived in under 10 minutes as promised.",
  "Way too many hidden charges now — handling fee, surge, small cart fee. Not worth it.",
  "App keeps crashing every time I try to check out, lost my cart twice today.",
  "Bread was stale and the expiry date was smudged out. Poor quality control.",
  "Customer support never responded to my complaint about a missing item.",
  "Love how easy it is to reorder my usual groceries, really convenient.",
  "Ordered vegetables but half of them were wilted and had to be thrown away.",
  "Prices are higher than the local store even before the delivery fee.",
  "Delivery guy was polite and everything arrived intact, good experience.",
].join("\n");

// Okabe-Ito, colorblind-safe
const SENT: Record<Sentiment, { bg: string; fg: string; label: string }> = {
  negative: { bg: "#D55E0022", fg: "#8a3d00", label: "negative" },
  neutral: { bg: "#9994", fg: "#555", label: "neutral" },
  positive: { bg: "#009E7322", fg: "#00694d", label: "positive" },
};

export function ReviewWorkflow() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // cap at 20 to stay under the Gemini free-tier per-minute token limit
  const reviews = text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 20);
  const max = Math.max(...(result?.themes.map((t) => t.count) ?? [1]), 1);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/analyze-reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reviews }),
      });
      if (!r.ok) throw new Error(r.status === 429 ? "Rate limited — try again shortly." : "Analysis failed.");
      setResult(await r.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border-2 border-brand/30 p-5">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-base font-bold">Run the workflow</h2>
        <span className="text-xs text-muted">
          Paste reviews (one per line) and the engine tags → clusters → scores them live.
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Paste one review per line, or click “Load sample”…"
        className="mt-3 w-full resize-y rounded-lg border border-line p-3 text-[13px] leading-snug focus:border-brand focus:outline-none"
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setText(SAMPLE)}
          className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-black/60 hover:border-black/25"
        >
          Load sample
        </button>
        <button
          type="button"
          onClick={run}
          disabled={busy || reviews.length === 0}
          className="rounded-lg bg-brand px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:bg-black/15"
        >
          {busy ? "Analyzing…" : `Run analysis${reviews.length ? ` · ${reviews.length}` : ""}`}
        </button>
        <span className="text-[11px] text-black/40">Up to 20 lines per run (batched into one call).</span>
      </div>

      {error && <p className="mt-3 rounded-lg bg-[#D55E0022] px-3 py-2 text-xs text-[#8a3d00]">{error}</p>}

      {result && result.themes.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              {result.tagged} reviews → {result.themes.length} themes
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                result.source === "llm" ? "bg-brand/12 text-brand" : "bg-amber-100 text-amber-800"
              }`}
            >
              {result.source === "llm" ? "AI tagging" : "rule-based tagging"}
            </span>
          </div>
          <ul className="mt-2 space-y-2">
            {result.themes.map((t, i) => (
              <li key={i} className="rounded-lg bg-tile p-3">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold">{t.label}</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ background: SENT[t.sentiment].bg, color: SENT[t.sentiment].fg }}
                  >
                    {SENT[t.sentiment].label}
                  </span>
                  <span className="ml-auto text-[11px] font-bold tabular-nums text-black/55">×{t.count}</span>
                </div>
                <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-white">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${Math.round((t.count / max) * 100)}%`, background: "#0072B2" }}
                  />
                </span>
                {t.example && <p className="mt-1.5 text-[11.5px] italic leading-snug text-black/50">“{t.example}”</p>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-snug text-black/40">
            Live analysis of your pasted reviews — a working demo of the tag → cluster → score step.
            Separate from the validated 1,284-document corpus below.
          </p>
        </div>
      )}
    </section>
  );
}
