import type { Survey, Theme } from "@/lib/discovery";

const pct = (n: number) => `${Math.round(n * 100)}%`;

/**
 * Decision snapshot — the same numbers the prose already reports, drawn so a PM
 * can act on a glance instead of reading. No charting dependency: the data is
 * static at build time, so plain SVG + CSS bars is the whole job. Every value is
 * read from the loaded files; nothing is hand-typed.
 */

/** Opportunity × strategic-fit quadrant. The decision view: which themes to act
 * on (high fit) vs which are merely loud (high opportunity, low fit). */
function PriorityMatrix({ themes }: { themes: Theme[] }) {
  const W = 340, H = 264;
  const L = 46, R = 14, T = 16, B = 36;
  const pw = W - L - R, ph = H - T - B;
  const XMAX = 100; // opportunity is a 0-100 share-of-voice score
  const YMAX = Math.max(0.7, ...themes.map((t) => t.strategic_fit)) + 0.03;
  const XSPLIT = 50, YSPLIT = 0.3; // act vs park thresholds

  const px = (opp: number) => L + (Math.min(opp, XMAX) / XMAX) * pw;
  const py = (fit: number) => T + (1 - Math.min(fit, YMAX) / YMAX) * ph;
  const r = (count: number) => Math.max(3.5, Math.min(12, Math.sqrt(count) * 1.1));

  // label the few core themes always + the two loudest context themes
  const labelled = new Set<string>([
    ...themes.filter((t) => t.relevance === "core").map((t) => t.id),
    ...[...themes.filter((t) => t.relevance === "context")]
      .sort((a, b) => b.opportunity - a.opportunity)
      .slice(0, 2)
      .map((t) => t.id),
  ]);
  const short = (label: string) => label.split(/\s+/).slice(0, 2).join(" ");

  return (
    <figure className="rounded-xl border border-line p-4">
      <figcaption className="text-sm font-bold">Where the opportunity actually is</figcaption>
      <p className="mt-0.5 text-[11px] leading-snug text-muted">
        Every theme by loudness (share of voice) against fit with the new-category goal. The loud
        themes sit low-right — operational, not strategic. Exploration themes are the top-left bet.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img"
        aria-label="Scatter plot of themes by opportunity versus strategic fit">
        {/* quadrant split lines */}
        <line x1={px(XSPLIT)} y1={T} x2={px(XSPLIT)} y2={T + ph} stroke="#e5e7eb" strokeDasharray="3 3" />
        <line x1={L} y1={py(YSPLIT)} x2={L + pw} y2={py(YSPLIT)} stroke="#e5e7eb" strokeDasharray="3 3" />
        {/* axes */}
        <line x1={L} y1={T} x2={L} y2={T + ph} stroke="#d1d5db" />
        <line x1={L} y1={T + ph} x2={L + pw} y2={T + ph} stroke="#d1d5db" />
        {/* quadrant tags */}
        <text x={L + pw - 4} y={T + 12} textAnchor="end" fontSize="8.5" fontWeight="700" fill="#0c831f">ACT</text>
        <text x={L + 4} y={T + 12} textAnchor="start" fontSize="8.5" fontWeight="700" fill="#0c831f">STRATEGIC BET</text>
        <text x={L + pw - 4} y={T + ph - 5} textAnchor="end" fontSize="8.5" fontWeight="700" fill="#9ca3af">OPERATIONAL</text>
        {/* axis labels */}
        <text x={L + pw / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#6b7280">Share of voice (opportunity) →</text>
        <text x={12} y={T + ph / 2} textAnchor="middle" fontSize="9" fill="#6b7280"
          transform={`rotate(-90 12 ${T + ph / 2})`}>Goal alignment (fit) →</text>
        {/* dots */}
        {themes.map((t) => {
          const core = t.relevance === "core";
          return (
            <g key={t.id}>
              <circle cx={px(t.opportunity)} cy={py(t.strategic_fit)} r={r(t.count)}
                fill={core ? "#0c831f" : "#9ca3af"} fillOpacity={core ? 0.85 : 0.5}
                stroke={core ? "#0c831f" : "#9ca3af"} strokeWidth="0.5" />
              {labelled.has(t.id) && (
                <text x={px(t.opportunity) + r(t.count) + 3} y={py(t.strategic_fit) + 3}
                  fontSize="8.5" fill={core ? "#0c831f" : "#6b7280"} fontWeight={core ? 700 : 400}>
                  {short(t.label)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex gap-4 text-[10.5px] text-muted">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-brand" /> core (exploration)</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-black/30" /> context (platform-wide)</span>
        <span className="ml-auto">dot size = mentions</span>
      </div>
    </figure>
  );
}

function BarChart({
  title,
  caption,
  rows,
}: {
  title: string;
  caption?: string;
  rows: { label: string; share: number; highlight?: boolean }[];
}) {
  const max = Math.max(...rows.map((r) => r.share), 0.01);
  return (
    <figure className="rounded-xl border border-line p-4">
      <figcaption className="text-sm font-bold">{title}</figcaption>
      {caption && <p className="mt-0.5 text-[11px] leading-snug text-muted">{caption}</p>}
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[104px_1fr_36px] items-center gap-2">
            <span className="truncate text-[11.5px] text-black/60" title={r.label}>{r.label}</span>
            <span className="h-3.5 overflow-hidden rounded-full bg-tile">
              <span
                className={`block h-full rounded-full ${r.highlight ? "bg-brand" : "bg-black/25"}`}
                style={{ width: `${Math.round((r.share / max) * 100)}%` }}
              />
            </span>
            <span className={`text-right text-[11.5px] font-bold tabular-nums ${r.highlight ? "text-brand" : "text-black/55"}`}>
              {pct(r.share)}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

const OCCASION = /festival|hosting|season|weather|occasion/i;

export function DecisionSnapshot({ survey, themes }: { survey: Survey | null; themes: Theme[] }) {
  return (
    <section>
      <h2 className="text-base font-bold">Decision snapshot</h2>
      <p className="text-xs text-muted">The findings below as charts — read the evidence underneath only if you want to.</p>
      <div className="mt-2 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <PriorityMatrix themes={themes} />
        {survey && (
          <div className="grid gap-4">
            <BarChart
              title="What actually blocks a new-category try"
              caption={`Survey barrier question, n=${survey.responses} — every barrier on equal footing.`}
              rows={survey.barrier_groups.slice(0, 3).map((b, i) => ({
                label: b.group,
                share: b.share,
                highlight: i === 0,
              }))}
            />
            <BarChart
              title="What breaks the habit"
              caption={`Recalled trigger of the last out-of-basket buy. Occasion-driven total: ${pct(survey.occasion_driven.share)}.`}
              rows={survey.out_of_basket_prompts
                .slice(0, 5)
                .map((p) => ({ label: p.label, share: p.share, highlight: OCCASION.test(p.label) }))}
            />
          </div>
        )}
      </div>
    </section>
  );
}
