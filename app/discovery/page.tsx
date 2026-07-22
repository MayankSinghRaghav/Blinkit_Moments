import {
  loadInsights,
  loadHoldout,
  type Bridge,
  type OccasionSpikers,
  type Theme,
} from "@/lib/discovery";
import { MIN_CONFIDENCE, pickQuotes } from "@/lib/quotes";

export const dynamic = "force-dynamic";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const SOURCE_LABEL: Record<string, string> = {
  play_store: "Google Play",
  app_store: "App Store",
  reddit: "Reddit",
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-black/45">{sub}</p>}
    </div>
  );
}

function ThemeRow({ theme, rank }: { theme: Theme; rank: number }) {
  const { shown, withheld } = pickQuotes(theme.quotes, theme.id);
  return (
    <details className="group border-b border-line last:border-0">
      <summary className="flex cursor-pointer items-center gap-3 py-3 hover:bg-tile">
        <span className="w-6 shrink-0 text-center text-xs font-bold text-black/30">{rank}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">{theme.label}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                theme.relevance === "core" ? "bg-brand text-white" : "bg-tile text-black/45"
              }`}
            >
              {theme.relevance}
            </span>
          </span>
          {theme.definition && (
            <span className="mt-0.5 block text-xs leading-snug text-black/50">
              {theme.definition}
            </span>
          )}
        </span>
        <span className="hidden shrink-0 text-right text-xs text-muted sm:block">
          <span className="block tabular-nums">n={theme.count}</span>
          <span className="block">
            {Object.entries(theme.per_source)
              .map(([s, n]) => `${SOURCE_LABEL[s] ?? s} ${n}`)
              .join(" · ")}
          </span>
        </span>
        <span className="flex w-40 shrink-0 gap-3">
          <span className="flex-1">
            <span className="block h-2 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-black/25"
                style={{ width: `${theme.opportunity}%` }}
              />
            </span>
            <span className="mt-0.5 block text-right text-[11px] tabular-nums text-black/45">
              {theme.opportunity}
            </span>
          </span>
          <span className="flex-1">
            <span className="block h-2 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-brand"
                style={{ width: `${Math.round(theme.strategic_fit * 100)}%` }}
              />
            </span>
            <span className="mt-0.5 block text-right text-[11px] font-bold tabular-nums text-brand">
              {theme.strategic_fit.toFixed(2)}
            </span>
          </span>
        </span>
      </summary>

      <div className="grid gap-4 pb-5 pl-9 pr-2 lg:grid-cols-[1fr_240px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Verbatim evidence
          </p>
          <ul className="mt-2 space-y-2">
            {shown.map((q, i) => (
              <li key={i} className="rounded-lg bg-tile p-3 text-[13px] leading-snug">
                <span className="text-black/75">“{q.quote}”</span>
                <span className="mt-1 block text-[11px] text-black/45">
                  {SOURCE_LABEL[q.source] ?? q.source}
                  {q.rating ? ` · ${q.rating}★` : ""} · {q.segment} · conf{" "}
                  {q.confidence.toFixed(2)}
                  {q.url && (
                    <>
                      {" · "}
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        source
                      </a>
                    </>
                  )}
                </span>
              </li>
            ))}
            {!shown.length && (
              <li className="text-xs text-black/40">
                No quote for this theme met the display bar — nothing was clean enough to show.
              </li>
            )}
          </ul>
          {withheld > 0 && (
            <p className="mt-2 text-[11px] text-black/35">
              {withheld} further quote{withheld === 1 ? "" : "s"} held back: below{" "}
              {MIN_CONFIDENCE} coding confidence, truncated, off-theme, or containing links or
              forum markup. All of them remain in the stored data.
            </p>
          )}
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <p className="font-bold uppercase tracking-wide text-muted">Signals</p>
            <dl className="mt-1 space-y-1">
              <div className="flex justify-between">
                <dt className="text-black/50">Share of coded corpus</dt>
                <dd className="tabular-nums">{pct(theme.frequency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/50">Negative sentiment</dt>
                <dd className="tabular-nums">{pct(theme.severity)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/50">Mean coding confidence</dt>
                <dd className="tabular-nums">{theme.confidence.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <p className="font-bold uppercase tracking-wide text-muted">Strategic fit</p>
            <dl className="mt-1 space-y-1">
              <div className="flex justify-between">
                <dt className="text-black/50">Open-coded as core (×0.5)</dt>
                <dd className="tabular-nums">{theme.strategic_components.core_relevance}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/50">Trial/risk unmet need (×0.3)</dt>
                <dd className="tabular-nums">{pct(theme.strategic_components.trial_need)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/50">New-to-user category (×0.2)</dt>
                <dd className="tabular-nums">{pct(theme.strategic_components.new_category)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-1">
                <dt className="text-black/50">Fit (weighted sum)</dt>
                <dd className="tabular-nums">{theme.strategic_fit}</dd>
              </div>
              <div className="flex justify-between font-bold">
                <dt>
                  {theme.opportunity} × {theme.strategic_fit} =
                </dt>
                <dd className="tabular-nums">{theme.strategic_priority}</dd>
              </div>
            </dl>
          </div>
          {theme.top_needs.length > 0 && (
            <div>
              <p className="font-bold uppercase tracking-wide text-muted">Unmet needs</p>
              <ul className="mt-1 space-y-0.5 text-black/60">
                {theme.top_needs.map(([need, n]) => (
                  <li key={need}>
                    {need} <span className="text-black/35">×{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}

function FramingBlock({ bridge }: { bridge: Bridge }) {
  // same display bar as the theme rows; these quotes carry the argument, so a
  // truncated or off-theme one here does the most damage
  const bridgeQuotes = bridge.quotes
    .flatMap((q) => pickQuotes([q], q.theme, 1).shown)
    .slice(0, 3);
  return (
    <div className="rounded-xl border-l-4 border-brand bg-brand/5 p-5">
      <h3 className="text-sm font-bold">
        Why the loudest complaint and our thesis are the same problem
      </h3>
      <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-black/70">
        <p>
          Pricing, delivery and support outrank every exploration theme on raw share of voice, and
          that ranking is left exactly as the data produced it. But share of voice answers
          &ldquo;what do people complain about most&rdquo; — not the goal we were set, which is how
          many customers buy from a <em>new</em> category each month.
        </p>
        <p>
          Reading the unmet needs rather than the theme labels, the two converge.{" "}
          <strong className="text-ink">{bridge.trial_need_docs} documents</strong> (
          {pct(bridge.share_of_coded)} of the coded corpus) name a need about trying something
          unfamiliar — a smaller pack, a way to tell if the quality is good, something not worth the
          risk. Of those,{" "}
          <strong className="text-ink">{bridge.in_context_themes} sit inside the context themes</strong>{" "}
          and only {bridge.in_core_themes} inside the exploration themes.
        </p>
        <p>
          So most of this need is filed under &ldquo;pricing&rdquo; — users describing the cost of a
          <em> first try</em>, not the cost of their weekly basket. Price-risk and the exploration
          barrier meet at one sentence: <strong className="text-ink">fear of wasting money on
          something unknown</strong>. That is precisely what a starter pack, a rating and a
          why-now line de-risk, which is what the MVP builds.
        </p>
      </div>

      {bridge.top_shared_needs.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Needs spanning both groups
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {bridge.top_shared_needs.map(([need, n]) => (
              <li
                key={need}
                className="rounded-full border border-brand/30 bg-white px-2.5 py-1 text-[11px]"
              >
                {need} <span className="text-black/40">×{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bridgeQuotes.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Filed as a context theme, describing trial risk
          </p>
          <ul className="mt-1 space-y-1.5">
            {bridgeQuotes.map((q, i) => (
              <li key={i} className="text-[12px] leading-snug text-black/65">
                “{q.quote}”{" "}
                <span className="text-black/40">
                  — {SOURCE_LABEL[q.source] ?? q.source}, coded {q.theme.replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[11px] text-black/40">
        Counted from the coding, not asserted: any document whose unmet need matches{" "}
        <code className="rounded bg-white px-1">{bridge.lexicon.slice(0, 60)}…</code>
      </p>
    </div>
  );
}

function SpikerCard({ spikers, coded }: { spikers: OccasionSpikers; coded: number }) {
  const { criteria } = spikers;
  return (
    <div className="rounded-xl border-l-4 border-brand bg-brand/5 p-5">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-bold">{spikers.label}</h2>
        <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          cross-cut
        </span>
        <span className="ml-auto text-sm font-extrabold tabular-nums">
          {spikers.size}
          <span className="ml-1 text-xs font-medium text-black/45">
            of {coded} ({pct(spikers.share_of_coded)})
          </span>
        </span>
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-black/70">{spikers.definition}</p>

      <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-muted">
        How it&apos;s derived
      </p>
      <p className="text-[12px] text-black/60">
        {spikers.derivation}. This is a behaviour, not a persona — it cuts across the five
        segments below rather than replacing one of them, so a document can be both a deal
        seeker and an occasion spike.
      </p>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
        <div className="rounded-lg bg-white p-2">
          <dt className="text-black/45">Life-stage only</dt>
          <dd className="font-bold tabular-nums">{criteria.life_stage_only}</dd>
        </div>
        <div className="rounded-lg bg-white p-2">
          <dt className="text-black/45">Occasion keyword only</dt>
          <dd className="font-bold tabular-nums">{criteria.occasion_keyword_only}</dd>
        </div>
        <div className="rounded-lg bg-white p-2">
          <dt className="text-black/45">Both</dt>
          <dd className="font-bold tabular-nums">{criteria.both}</dd>
        </div>
      </dl>

      {spikers.top_keywords.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Occasion signals matched
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {spikers.top_keywords.map(([kw, n]) => (
              <li
                key={kw}
                className="rounded-full border border-brand/30 bg-white px-2 py-0.5 text-[11px]"
              >
                {kw} <span className="text-black/40">×{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {spikers.top_themes.length > 0 && (
        <p className="mt-3 text-[12px] text-black/60">
          <span className="font-bold text-ink">Concentrates in:</span>{" "}
          {spikers.top_themes.map((t) => `${t.label} (${t.n})`).join(" · ")}
        </p>
      )}

      <p className="mt-3 text-[11px] leading-snug text-black/40">
        Keywords come from {spikers.keyword_source} — {spikers.keywords_used} used, matched on
        whole words. Excluded as ambiguous in prose: {spikers.keywords_excluded.join(", ")} (day
        abbreviations prefix-match &ldquo;friend&rdquo; and &ldquo;satisfied&rdquo;; in app reviews
        &ldquo;resolution&rdquo; means complaint resolution).
      </p>
    </div>
  );
}

export default function DiscoveryPage() {
  const { data, fixture } = loadInsights();
  const holdout = loadHoldout();
  // An agreement score is only meaningful next to real coding. Withhold it if
  // the report itself was scored against fixture codes, or if the page is still
  // falling back to fixture insights — a real kappa beside placeholder themes
  // would imply the themes had been validated too.
  const realHoldout = holdout && !holdout.fixture_derived && !fixture ? holdout : null;

  if (!data) {
    return (
      <div className="rounded-xl border border-dashed border-line p-8 text-sm text-black/50">
        No analysis yet. Run{" "}
        <code className="rounded bg-tile px-1.5 py-0.5">npm run discovery:tag</code> then{" "}
        <code className="rounded bg-tile px-1.5 py-0.5">node scripts/discovery/3-analyze.mjs</code>.
      </div>
    );
  }

  const core = data.themes.filter((t) => t.relevance === "core");
  const context = data.themes.filter((t) => t.relevance === "context");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold">Discovery engine</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Why users repeat the same categories, mined from real quick-commerce feedback. Open
          coding induces the themes from the data; closed coding applies them to the full corpus.
        </p>
      </div>

      {fixture && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <strong>Fixture data.</strong> These numbers come from a seeded placeholder coding used
          to build and test the pipeline — they are <em>not</em> findings. Real coding runs via{" "}
          <code>npm run discovery:tag</code>, which is capped at 20 LLM calls per day on the free
          tier.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat
          label="Corpus"
          value={String(data.corpus.documents)}
          sub={Object.entries(data.corpus.by_source)
            .map(([s, n]) => `${SOURCE_LABEL[s] ?? s} ${n}`)
            .join(" · ")}
        />
        <Stat
          label="Coded"
          value={String(data.corpus.with_theme)}
          sub={`${data.corpus.unclassified} fit no theme`}
        />
        <Stat
          label="Valid themes"
          value={String(data.validity.valid_themes)}
          sub={`${data.validity.rejected_themes.length} rejected`}
        />
        <Stat
          label="Agreement (κ)"
          value={realHoldout ? realHoldout.cohens_kappa.toFixed(2) : "—"}
          sub={
            realHoldout
              ? `${realHoldout.interpretation}, n=${realHoldout.coded_pairs}`
              : "hold-out not coded yet"
          }
        />
      </div>

      <FramingBlock bridge={data.bridge} />

      <div className="flex items-center justify-end gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-6 rounded-full bg-black/25" /> raw opportunity (share of voice)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-6 rounded-full bg-brand" /> strategic fit (goal alignment)
        </span>
      </div>

      <section>
        <h2 className="text-base font-bold">Core themes — category exploration</h2>
        <p className="text-xs text-muted">
          Themes bearing directly on why users don&apos;t try new categories. Ranked by strategic
          priority (raw × fit); the raw score stays visible on every row.
        </p>
        <div className="mt-2 rounded-xl border border-line px-3">
          {core.length ? (
            [...core]
              .sort((a, b) => b.strategic_priority - a.strategic_priority)
              .map((t, i) => <ThemeRow key={t.id} theme={t} rank={i + 1} />)
          ) : (
            <p className="py-4 text-sm text-black/40">No core themes surfaced.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold">Context themes — platform-wide</h2>
        <p className="text-xs text-muted">
          What users mostly talk about. Kept visible because it&apos;s the honest denominator: the
          exploration problem is a minority of the conversation.
        </p>
        <div className="mt-2 rounded-xl border border-line px-3">
          {context.map((t, i) => (
            <ThemeRow key={t.id} theme={t} rank={i + 1} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <SpikerCard spikers={data.occasion_spikers} coded={data.corpus.with_theme} />

          <div className="rounded-xl border border-line p-5">
            <h2 className="text-sm font-bold">Coder-assigned segments</h2>
            <p className="text-[11px] text-muted">
              The five personas the coder chooses between, unchanged.
            </p>
            <ul className="mt-3 space-y-2.5">
              {data.segments.map((s) => (
                <li key={s.id}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium">
                      {s.id.replace(/_/g, " ")}
                      {s.id === "new_life_stage" && (
                        <span className="ml-1.5 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand">
                          feeds spikers
                        </span>
                      )}
                    </span>
                    <span className="text-xs tabular-nums text-muted">{s.count}</span>
                  </div>
                  <p className="text-xs text-black/45">
                    {s.top_themes.map((t) => t.label).join(" · ") || "—"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-line p-5">
          <h2 className="text-sm font-bold">How this was validated</h2>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-black/60">
            <li>
              <strong className="text-ink">Cross-source rule.</strong> {data.validity.rule}{" "}
              {data.validity.rejected_themes.length > 0 && (
                <>
                  Rejected:{" "}
                  {data.validity.rejected_themes.map((t) => t.label).join(", ")}.
                </>
              )}
            </li>
            <li>
              <strong className="text-ink">Verbatim quotes.</strong> Every quote is checked against
              the source document before it is stored; anything the model paraphrased is dropped
              rather than shown.
            </li>
            <li>
              <strong className="text-ink">Blind hold-out coding.</strong>{" "}
              {realHoldout ? (
                <>
                  {realHoldout.coded_pairs} documents coded by hand without seeing the model&apos;s
                  label: {pct(realHoldout.raw_agreement)} raw agreement,{" "}
                  {pct(realHoldout.expected_by_chance)} expected by chance, κ ={" "}
                  {realHoldout.cohens_kappa} ({realHoldout.interpretation}). Computed from the two
                  label sets, not asserted.
                </>
              ) : (
                <>
                  Sheet generated but not yet coded. Run{" "}
                  <code>node scripts/discovery/4-holdout.mjs</code>.
                </>
              )}
            </li>
            <li>
              <strong className="text-ink">Two axes, neither adjusted.</strong> Opportunity ={" "}
              {data.scoring.opportunity} Strategic fit = {data.scoring.strategic_fit}{" "}
              {data.scoring.note}
            </li>
            <li>
              <strong className="text-ink">Open before closed.</strong> The codebook is induced from
              a stratified sample first, so the taxonomy comes from the data rather than from the
              hypothesis being tested.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
