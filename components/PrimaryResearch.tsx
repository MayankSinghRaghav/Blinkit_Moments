/**
 * Primary research — the 7 REAL interviews from data/interviews/interviews.md.
 * Hardcoded transcription of that file (names, segments, one key line each). No
 * composite personas, no fabricated quotes: verbatim lines are quoted, the rest
 * are paraphrased mindsets marked as such. Keep this consistent with the md.
 */
type Respondent = {
  name: string;
  segment: string;
  line: string;
  verbatim: boolean;
  target?: boolean;
};

const RESPONDENTS: Respondent[] = [
  { name: "Neha", segment: "Routine Replenisher", line: "Before opening the app, I already know exactly what I need.", verbatim: true },
  { name: "Arjun", segment: "Deal Hunter", line: "Only experiments when there's a clear value proposition — a deal.", verbatim: false },
  { name: "Aditya", segment: "Occasion Shopper", line: "I shop based on the occasion rather than browsing.", verbatim: true, target: true },
  { name: "Rohan", segment: "Speed-First User", line: "The mission is already defined before I open the app.", verbatim: false },
  { name: "Meghna", segment: "Cautious Explorer", line: "Would explore with a short explanation and reviews from similar users.", verbatim: false },
  { name: "Ananya", segment: "Recommendation Follower", line: "Recommendations should feel relevant to what's already in the cart.", verbatim: false },
  { name: "Vikram", segment: "Practical Planner", line: "I need a clear explanation of why a product is recommended.", verbatim: false, target: true },
];

export function PrimaryResearch() {
  return (
    <section className="rounded-xl border border-line p-5">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-base font-bold">Primary research — 7 interviews</h2>
        <span className="text-xs text-muted">
          ~15-min semi-structured, recruited from survey opt-ins. Directional, not representative.
        </span>
      </div>

      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {RESPONDENTS.map((r) => (
          <li key={r.name} className="rounded-lg bg-tile p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold">{r.name}</span>
              <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-black/50">
                {r.segment}
              </span>
              {r.target && (
                <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  target segment
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px] leading-snug text-black/70">
              {r.verbatim ? <em>&ldquo;{r.line}&rdquo;</em> : r.line}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg border-l-4 border-brand bg-brand/5 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
          How the interviews validated / challenged the AI engine
        </p>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-black/70">
          <li>
            <strong className="text-ink">Validated (habit is the barrier):</strong> 4 of 7 (Neha,
            Rohan, Vikram, and Aditya outside occasions) described a pre-defined, speed-first
            mission. No respondent cited distrust of the platform.
          </li>
          <li>
            <strong className="text-ink">Validated (the trigger is an occasion):</strong> Aditya and
            Vikram name occasions directly; Rohan discovers off-app — matching the survey&apos;s
            occasion-driven out-of-basket finding.
          </li>
          <li>
            <strong className="text-ink">Challenged / refined (uncertainty):</strong> the engine and
            survey suggested product uncertainty; the interviews downgraded it to a{" "}
            <em>secondary</em> friction — real, but solved by a one-line &ldquo;why&rdquo; plus
            reviews (Meghna, Rohan), not the core barrier.
          </li>
        </ul>
        <p className="mt-2 text-[11px] text-black/40">
          Target segment (Occasion Shoppers) = Aditya &amp; Vikram. Source:
          data/interviews/interviews.md.
        </p>
      </div>
    </section>
  );
}
