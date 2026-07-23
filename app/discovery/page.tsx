import {
  loadInsights,
  loadHoldout,
  loadSurvey,
  loadSensitivity,
  type Survey,
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

function FramingBlock({
  bridge,
  themes,
  survey,
}: {
  bridge: Bridge;
  themes: Theme[];
  survey: Survey | null;
}) {
  const bridgeQuotes = bridge.quotes
    .flatMap((q) => pickQuotes([q], q.theme, 1).shown)
    .slice(0, 3);

  // Derived from the files, never typed into the prose: if a re-run reorders the
  // themes or the survey is re-exported, this block follows the data.
  const topCore = [...themes]
    .filter((t) => t.relevance === "core")
    .sort((a, b) => b.strategic_priority - a.strategic_priority)[0];
  const grp = (g: string) => survey?.barrier_groups.find((b) => b.group === g);
  const habit = grp("habit");
  const quality = grp("quality");
  const price = grp("price");
  // only the prompts that actually count toward occasion_driven — listing the
  // overall top two put "ran out of something at home" inside the occasion
  // figure, which it is not part of
  const OCCASION_PROMPT = /festival|hosting|season|weather/i;
  const topPrompts = (survey?.out_of_basket_prompts ?? [])
    .filter((p) => OCCASION_PROMPT.test(p.label))
    .slice(0, 2);

  return (
    <div className="rounded-xl border-l-4 border-brand bg-brand/5 p-5">
      <h3 className="text-sm font-bold">
        The barrier is habit. The thing that breaks it is an occasion.
      </h3>

      <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-black/70">
        <p>
          <strong className="text-ink">Where we were wrong.</strong> We began by assuming the
          barrier was the cost of a first try. The survey&rsquo;s barrier question — the one place
          every barrier competes on equal footing — puts price
          {price && <> at <strong className="text-ink">{pct(price.share)}</strong></>} and product
          uncertainty{quality && <> at <strong className="text-ink">{pct(quality.share)}</strong></>}
          , while{" "}
          {habit && (
            <>
              <strong className="text-ink">{pct(habit.share)}</strong> of respondents named a habit
              barrier: they open the app already knowing what they need, search rather than browse,
              and are content with what they buy.
            </>
          )}{" "}
          This corpus agrees by omission — only {bridge.trial_need_docs} of{" "}
          {Math.round(bridge.trial_need_docs / (bridge.share_of_coded || 1))} coded documents name a
          trial or risk need, and a theme about category-exploration deterrents appeared once and
          was rejected by our own cross-source rule.
        </p>

        <p>
          <strong className="text-ink">What breaks the habit.</strong> Asked what actually prompted
          their last purchase outside the usual basket — recall, not a hypothetical —{" "}
          {survey && (
            <>
              <strong className="text-ink">{pct(survey.occasion_driven.share)}</strong> named an
              occasion
              {topPrompts.length === 2 && (
                <> ({topPrompts.map((p) => `${p.label.toLowerCase()} ${pct(p.share)}`).join(", ")})</>
              )}
              , against 8% who named an in-app recommendation.
            </>
          )}{" "}
          Four of six interviewees described intent-driven, speed-first shopping without being
          asked: <em>&ldquo;I already know exactly what I need before opening the app&rdquo;</em>{" "}
          (Rhea), <em>&ldquo;I just want to finish shopping quickly&rdquo;</em> (Nikhil).
        </p>

        <p>
          <strong className="text-ink">Why this corpus is quiet about it.</strong> Nobody writes a
          review about the pet food they did not buy. Public feedback records failed transactions,
          not absent ones
          {topCore && (
            <>
              {" "}
              — which is why its largest core theme is {topCore.label} (n={topCore.count})
            </>
          )}
          . We report that as a limitation of the instrument, not as proof of a silent problem; the
          claim rests on the survey and interviews, and we have said so rather than reweighting the
          corpus until it agreed.
        </p>

        <p className="rounded-lg bg-white/70 p-3">
          <strong className="text-ink">What changed in the product because of this.</strong>{" "}
          Suggestions capped at 3 (Nikhil: <em>&ldquo;one or two useful suggestions, not
          ten&rdquo;</em>). <code>fitness_kickoff</code> and <code>baby_arrival</code> removed —
          zero mentions across 6 interviews and 26 responses. <code>hosting_guests</code> and{" "}
          <code>movie_night</code> added, both volunteered by participants. Occasion inference is
          the delivery mechanism; the habit is the problem.
        </p>
      </div>

      {survey && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {survey.barrier_groups.slice(0, 3).map((b) => (
            <div key={b.group} className="rounded-lg bg-white p-2.5">
              <p className="text-[11px] uppercase tracking-wide text-black/45">{b.group}</p>
              <p className="text-lg font-extrabold tabular-nums">{pct(b.share)}</p>
              <p className="text-[11px] text-black/40">{b.count} of {survey.responses}</p>
            </div>
          ))}
        </div>
      )}

      {bridgeQuotes.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Trial-risk language found in the corpus
          </p>
          <ul className="mt-1 space-y-1.5">
            {bridgeQuotes.map((q, i) => (
              <li key={i} className="text-[12px] leading-snug text-black/65">
                &ldquo;{q.quote}&rdquo;{" "}
                <span className="text-black/40">
                  — {SOURCE_LABEL[q.source] ?? q.source}, coded {q.theme.replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[11px] leading-snug text-black/40">
        Survey figures computed from data/interviews/survey-responses.csv by
        scripts/discovery/5-survey.mjs (n={survey?.responses ?? 0}); corpus figures from the coding
        run. {survey?.caveats[0]} Stated-preference questions are reported separately in
        data/interviews/survey-findings.md and are not used above.
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
  const survey = loadSurvey();
  const sens = loadSensitivity();
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
          label="Accepted"
          value={String(data.corpus.with_theme)}
          sub={`${data.corpus.no_theme + data.corpus.low_confidence} rejected`}
        />
        <Stat
          label="Rejected"
          value={String(data.corpus.no_theme + data.corpus.low_confidence)}
          sub={`${data.corpus.no_theme} fit no theme · ${data.corpus.low_confidence} below ${data.corpus.min_code_confidence} confidence`}
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

      <FramingBlock bridge={data.bridge} themes={data.themes} survey={survey} />

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
              <strong className="text-ink">Confidence floor.</strong> {data.validity.code_rule}{" "}
              {data.corpus.no_theme} document{data.corpus.no_theme === 1 ? "" : "s"} fit no theme
              and {data.corpus.low_confidence} were coded below the floor; all{" "}
              {data.corpus.no_theme + data.corpus.low_confidence} are excluded from every figure
              on this page and remain in the stored data.
            </li>
            <li>
              <strong className="text-ink">Cross-source rule.</strong> {data.validity.rule}{" "}
              {data.validity.valid_themes} theme
              {data.validity.valid_themes === 1 ? "" : "s"} passed,{" "}
              {data.validity.rejected_themes.length} rejected.{" "}
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
            {sens && (
              <li>
                <strong className="text-ink">Weight sensitivity, reported against us.</strong>{" "}
                Re-scored across {sens.opportunity.weightings_tested} weightings. The{" "}
                <em>strategic fit</em> ranking is robust (Spearman{" "}
                {sens.strategic_fit.mean_spearman}, top theme unchanged{" "}
                {pct(sens.strategic_fit.top1_stable)}), and a core theme tops strategic priority in{" "}
                <strong className="text-ink">
                  {pct(sens.conclusions.core_theme_leads_strategic_priority)}
                </strong>{" "}
                of them — that conclusion does not depend on our weights. The{" "}
                <em>raw opportunity</em> ranking is not robust: the top theme changes in{" "}
                {pct(1 - sens.opportunity.top1_stable)} of weightings and the worst-case rank
                correlation is {sens.opportunity.min_spearman}. Read the opportunity order as a
                magnitude band, not an ordering. The confidence floor rejects{" "}
                {sens.confidence_floor_sweep.find((f) => f.floor === 0.5)?.rejected_low_confidence ?? 0}{" "}
                codes at 0.5, so it is currently doing no work.
              </li>
            )}
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
