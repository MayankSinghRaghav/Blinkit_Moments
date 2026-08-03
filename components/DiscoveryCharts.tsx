import type { Insights, Survey, Theme } from "@/lib/discovery";

const pct = (n: number) => `${Math.round(n * 100)}%`;

// Okabe-Ito — colorblind-safe categorical palette
const OKABE = ["#0072B2", "#E69F00", "#009E73", "#D55E00", "#CC79A7", "#56B4E9", "#F0E442", "#333333"];
const SOURCE_LABEL: Record<string, string> = {
  play_store: "Google Play",
  app_store: "App Store",
  reddit: "Reddit",
};

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

/** Horizontal count bars with explicit per-row colours (colorblind-safe). */
function CountBars({
  title,
  caption,
  rows,
}: {
  title: string;
  caption?: string;
  rows: { label: string; count: number; color: string }[];
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <figure className="rounded-xl border border-line p-4">
      <figcaption className="text-sm font-bold">{title}</figcaption>
      {caption && <p className="mt-0.5 text-[11px] leading-snug text-muted">{caption}</p>}
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[128px_1fr_46px] items-center gap-2">
            <span className="truncate text-[11.5px] text-black/60" title={r.label}>{r.label}</span>
            <span className="h-3.5 overflow-hidden rounded-full bg-tile">
              <span className="block h-full rounded-full" style={{ width: `${Math.round((r.count / max) * 100)}%`, background: r.color }} />
            </span>
            <span className="text-right text-[11.5px] font-bold tabular-nums text-black/55">
              {r.count.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Pipeline yield funnel: corpus → coded → rejected. */
function Funnel({ corpus, dedup }: { corpus: Insights["corpus"]; dedup?: number }) {
  const total = corpus.documents || 1;
  const grounded = Math.round((corpus.with_theme / total) * 100);
  const stages = [
    { label: "Fetched & deduped", n: corpus.documents, color: OKABE[0] },
    { label: "Coded to a theme", n: corpus.with_theme, color: OKABE[2] },
    { label: "Rejected (no theme / low-conf)", n: corpus.no_theme + corpus.low_confidence, color: OKABE[3] },
  ];
  return (
    <figure className="rounded-xl border border-line p-4">
      <figcaption className="text-sm font-bold">Pipeline yield</figcaption>
      <p className="mt-0.5 text-[11px] leading-snug text-muted">
        {grounded}% grounded in a theme{dedup != null && <> · {dedup} duplicates removed in dedup</>}.
        Every document either grounds a theme or is dropped — the rejects stay visible.
      </p>
      <ul className="mt-3 space-y-2.5">
        {stages.map((s) => (
          <li key={s.label}>
            <div className="flex items-baseline justify-between text-[11.5px]">
              <span className="text-black/60">{s.label}</span>
              <span className="font-bold tabular-nums text-black/70">
                {s.n.toLocaleString("en-IN")} <span className="text-black/35">({pct(s.n / total)})</span>
              </span>
            </div>
            <span className="mt-0.5 block h-3.5 overflow-hidden rounded-full bg-tile">
              <span className="block h-full rounded-full" style={{ width: `${Math.round((s.n / total) * 100)}%`, background: s.color }} />
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

// P3: the two required sources we have not ingested yet. Shown as honest
// connectors — the pipeline supports them (see scripts/discovery/1-normalize),
// but a live pull needs Apify (X/Twitter is paywalled). No volume is faked.
const CONNECTORS = [
  { label: "Community forums (Quora)", note: "connector ready · not yet ingested" },
  { label: "Social (X / Twitter)", note: "connector ready · paywalled on Apify" },
];

/** Source split of the corpus + the not-yet-ingested connectors, labelled honestly. */
function SourceBreakdown({ sources }: { sources: { label: string; count: number; color: string }[] }) {
  const max = Math.max(...sources.map((s) => s.count), 1);
  return (
    <figure className="rounded-xl border border-line p-4">
      <figcaption className="text-sm font-bold">Where the reviews came from</figcaption>
      <p className="mt-0.5 text-[11px] leading-snug text-muted">
        Ingested sources (real coded volume) plus the connectors still to be pulled.
      </p>
      <ul className="mt-3 space-y-2">
        {sources.map((r) => (
          <li key={r.label} className="grid grid-cols-[128px_1fr_46px] items-center gap-2">
            <span className="truncate text-[11.5px] text-black/60" title={r.label}>{r.label}</span>
            <span className="h-3.5 overflow-hidden rounded-full bg-tile">
              <span className="block h-full rounded-full" style={{ width: `${Math.round((r.count / max) * 100)}%`, background: r.color }} />
            </span>
            <span className="text-right text-[11.5px] font-bold tabular-nums text-black/55">
              {r.count.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
        {CONNECTORS.map((c) => (
          <li key={c.label} className="grid grid-cols-[128px_1fr_46px] items-center gap-2 opacity-70">
            <span className="truncate text-[11.5px] text-black/45" title={c.label}>{c.label}</span>
            <span className="rounded-full border border-dashed border-line px-2 py-0.5 text-[10px] italic text-black/40">
              {c.note}
            </span>
            <span className="text-right text-[11.5px] font-medium tabular-nums text-black/30">—</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function CorpusCharts({
  corpus,
  themes,
  segments,
  dedup,
}: {
  corpus: Insights["corpus"];
  themes: Theme[];
  segments: Insights["segments"];
  dedup?: number;
}) {
  const sources = Object.entries(corpus.by_source).map(([k, n], i) => ({
    label: SOURCE_LABEL[k] ?? k,
    count: n,
    color: OKABE[i % OKABE.length],
  }));
  const contextThemes = themes
    .filter((t) => t.relevance === "context")
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((t) => ({ label: t.label, count: t.count, color: OKABE[4] }));
  const segs = [...segments]
    .sort((a, b) => b.count - a.count)
    .map((s, i) => ({ label: s.id.replace(/_/g, " "), count: s.count, color: OKABE[i % OKABE.length] }));

  return (
    <section>
      <h2 className="text-base font-bold">Corpus at a glance</h2>
      <p className="text-xs text-muted">Six views of the {corpus.documents.toLocaleString("en-IN")}-document corpus — all from the coding run.</p>
      <div className="mt-2 grid gap-4 lg:grid-cols-2">
        <SourceBreakdown sources={sources} />
        <Funnel corpus={corpus} dedup={dedup} />
        <CountBars title="What users mostly talk about" caption="Largest context themes (platform-wide), by document count." rows={contextThemes} />
        <CountBars title="Coder-assigned segments" caption="Distribution across the five behavioural segments." rows={segs} />
      </div>
    </section>
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
