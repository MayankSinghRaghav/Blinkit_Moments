import type { Survey, Theme } from "@/lib/discovery";

const pct = (n: number) => `${Math.round(n * 100)}%`;

/**
 * Decision snapshot — the same numbers the prose already reports, drawn so a PM
 * can act on a glance instead of reading. No charting dependency: the data is
 * static at build time, so plain SVG + CSS bars is the whole job. Every value is
 * read from the loaded files; nothing is hand-typed.
 *
 * Dots on the matrix are numbered; the ranked bar below is their legend — same
 * numbering, so the two read as one unit (shape story + exact values).
 */

/** Opportunity × strategic-fit quadrant. Dots carry numbers only; names + values
 * live in the ranked bar below, so nothing overlaps. */
function PriorityMatrix({ themes, numOf }: { themes: Theme[]; numOf: Map<string, number> }) {
  const W = 360, H = 268;
  const L = 46, R = 16, T = 18, B = 42;
  const pw = W - L - R, ph = H - T - B;
  const XMAX = 100; // opportunity is a 0-100 share-of-voice score
  const YMAX = 0.75; // core themes top out near 0.58; headroom keeps ticks clean
  const XSPLIT = 50, YSPLIT = 0.3;
  const XT = [0, 50, 100];
  const YT = [0, 0.25, 0.5, 0.75];

  const px = (opp: number) => L + (Math.min(opp, XMAX) / XMAX) * pw;
  const py = (fit: number) => T + (1 - Math.min(fit, YMAX) / YMAX) * ph;
  const r = (count: number) => Math.max(3.5, Math.min(10, Math.sqrt(count) * 0.95));

  return (
    <figure className="rounded-xl border border-line p-4">
      <figcaption className="text-sm font-bold">Where the opportunity actually is</figcaption>
      <p className="mt-0.5 text-[11px] leading-snug text-muted">
        Every theme by loudness (share of voice) against fit with the new-category goal. Core themes
        are numbered (matching the ranked list below); grey is the operational cluster.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img"
        aria-label="Scatter plot of themes by opportunity versus strategic fit">
        {/* quadrant watermarks — behind everything so a dot can never collide with a tag */}
        <text x={L + 6} y={T + 13} fontSize="9" fontWeight="700" fill="#0c831f" fillOpacity="0.4">STRATEGIC BET</text>
        <text x={L + pw - 4} y={T + 13} textAnchor="end" fontSize="9" fontWeight="700" fill="#9ca3af" fillOpacity="0.55">ACT · empty</text>
        <text x={L + pw - 4} y={T + ph - 6} textAnchor="end" fontSize="9" fontWeight="700" fill="#9ca3af" fillOpacity="0.45">OPERATIONAL</text>
        {/* quadrant split lines */}
        <line x1={px(XSPLIT)} y1={T} x2={px(XSPLIT)} y2={T + ph} stroke="#e5e7eb" strokeDasharray="3 3" />
        <line x1={L} y1={py(YSPLIT)} x2={L + pw} y2={py(YSPLIT)} stroke="#e5e7eb" strokeDasharray="3 3" />
        {/* axes */}
        <line x1={L} y1={T} x2={L} y2={T + ph} stroke="#d1d5db" />
        <line x1={L} y1={T + ph} x2={L + pw} y2={T + ph} stroke="#d1d5db" />
        {/* ticks */}
        {XT.map((v) => (
          <g key={`x${v}`}>
            <line x1={px(v)} y1={T + ph} x2={px(v)} y2={T + ph + 4} stroke="#d1d5db" />
            <text x={px(v)} y={T + ph + 14} textAnchor="middle" fontSize="8" fill="#9ca3af">{v}</text>
          </g>
        ))}
        {YT.map((v) => (
          <g key={`y${v}`}>
            <line x1={L - 4} y1={py(v)} x2={L} y2={py(v)} stroke="#d1d5db" />
            <text x={L - 6} y={py(v) + 3} textAnchor="end" fontSize="8" fill="#9ca3af">{v}</text>
          </g>
        ))}
        {/* axis titles */}
        <text x={L + pw / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#6b7280">Share of voice (opportunity) →</text>
        <text x={13} y={T + ph / 2} textAnchor="middle" fontSize="9" fill="#6b7280"
          transform={`rotate(-90 13 ${T + ph / 2})`}>Goal alignment (fit) →</text>
        {/* dots — only the core dots are numbered. The context cluster sits at
            fit≈0 with near-identical coordinates, so numbering it just stacks
            digits; its identity lives in the ranked bar below instead. */}
        {themes.map((t) => {
          const core = t.relevance === "core";
          const cx = px(t.opportunity), cy = py(t.strategic_fit), rad = r(t.count);
          const n = numOf.get(t.id);
          const inside = rad >= 6;
          return (
            <g key={t.id}>
              <circle cx={cx} cy={cy} r={rad}
                fill={core ? "#0c831f" : "#9ca3af"} fillOpacity={core ? 0.9 : 0.55}
                stroke="#ffffff" strokeWidth="1" />
              {core &&
                (inside ? (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                    fontSize="7.5" fontWeight="700" fill="#ffffff">{n}</text>
                ) : (
                  <text x={cx + rad + 2} y={cy + 3} fontSize="8" fontWeight="700" fill="#0c831f">{n}</text>
                ))}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex gap-4 text-[10.5px] text-muted">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-brand" /> core (exploration)</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-black/30" /> context (platform-wide)</span>
        <span className="ml-auto">dot size = mentions</span>
      </div>
      <p className="mt-2 rounded-lg bg-tile px-2.5 py-1.5 text-[11px] leading-snug text-black/55">
        The <strong className="text-black/70">ACT</strong> quadrant is empty — nothing users
        complain about loudly also aligns with new-category adoption. The exploration themes are a
        quiet <strong className="text-brand">strategic bet</strong>, not a share-of-voice winner.
        That is the finding.
      </p>
    </figure>
  );
}

/** B — the "just tell me the order" view, and the matrix's legend. */
function RankedPriority({ ranked }: { ranked: Theme[] }) {
  const max = Math.max(...ranked.map((t) => t.strategic_priority), 0.01);
  return (
    <figure className="mt-4 rounded-xl border border-line p-4">
      <figcaption className="text-sm font-bold">Themes ranked by priority</figcaption>
      <p className="mt-0.5 text-[11px] leading-snug text-muted">
        Strategic priority = share of voice × goal fit. Green = exploration themes. Numbers match the
        matrix.
      </p>
      <ul className="mt-3 space-y-1.5">
        {ranked.map((t, i) => {
          const core = t.relevance === "core";
          return (
            <li key={t.id} className="grid grid-cols-[20px_140px_1fr_40px] items-center gap-2">
              <span className="text-right text-[11px] font-bold tabular-nums text-black/35">{i + 1}</span>
              <span className="truncate text-[11.5px] text-black/70" title={t.label}>{t.label}</span>
              <span className="h-3 overflow-hidden rounded-full bg-tile">
                <span
                  className={`block h-full rounded-full ${core ? "bg-brand" : "bg-black/25"}`}
                  style={{ width: `${Math.max(2, Math.round((t.strategic_priority / max) * 100))}%` }}
                />
              </span>
              <span className={`text-right text-[11px] font-bold tabular-nums ${core ? "text-brand" : "text-black/50"}`}>
                {t.strategic_priority.toFixed(1)}
              </span>
            </li>
          );
        })}
      </ul>
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
  // one ranking drives both the matrix numbers and the ranked bar
  const ranked = [...themes].sort((a, b) => b.strategic_priority - a.strategic_priority);
  const numOf = new Map(ranked.map((t, i) => [t.id, i + 1]));

  return (
    <section>
      <h2 className="text-base font-bold">Decision snapshot</h2>
      <p className="text-xs text-muted">The findings below as charts — read the evidence underneath only if you want to.</p>
      <div className="mt-2 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <PriorityMatrix themes={themes} numOf={numOf} />
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
      <RankedPriority ranked={ranked} />
    </section>
  );
}
