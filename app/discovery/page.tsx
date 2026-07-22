import { loadInsights, loadHoldout, type Theme } from "@/lib/discovery";

export const dynamic = "force-dynamic";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const SOURCE_LABEL: Record<string, string> = {
  play_store: "Google Play",
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
        <span className="w-28 shrink-0">
          <span className="block h-2 overflow-hidden rounded-full bg-line">
            <span
              className="block h-full rounded-full bg-brand"
              style={{ width: `${theme.opportunity}%` }}
            />
          </span>
          <span className="mt-0.5 block text-right text-[11px] font-bold tabular-nums">
            {theme.opportunity}
          </span>
        </span>
      </summary>

      <div className="grid gap-4 pb-5 pl-9 pr-2 lg:grid-cols-[1fr_240px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Verbatim evidence
          </p>
          <ul className="mt-2 space-y-2">
            {theme.quotes.map((q, i) => (
              <li key={i} className="rounded-lg bg-tile p-3 text-[13px] leading-snug">
                <span className="text-black/75">“{q.quote}”</span>
                <span className="mt-1 block text-[11px] text-black/45">
                  {SOURCE_LABEL[q.source] ?? q.source}
                  {q.rating ? ` · ${q.rating}★` : ""} · {q.segment}
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
            {!theme.quotes.length && (
              <li className="text-xs text-black/40">
                No quote passed the verbatim check for this theme.
              </li>
            )}
          </ul>
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

export default function DiscoveryPage() {
  const { data, fixture } = loadInsights();
  const holdout = loadHoldout();

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
          value={holdout ? holdout.cohens_kappa.toFixed(2) : "—"}
          sub={holdout ? `${holdout.interpretation}, n=${holdout.coded_pairs}` : "hold-out not coded yet"}
        />
      </div>

      <section>
        <h2 className="text-base font-bold">Core themes — category exploration</h2>
        <p className="text-xs text-muted">
          Themes bearing directly on why users don&apos;t try new categories. Ranked by opportunity
          score.
        </p>
        <div className="mt-2 rounded-xl border border-line px-3">
          {core.length ? (
            core.map((t, i) => <ThemeRow key={t.id} theme={t} rank={i + 1} />)
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
        <div className="rounded-xl border border-line p-5">
          <h2 className="text-sm font-bold">Segments</h2>
          <ul className="mt-3 space-y-2.5">
            {data.segments.map((s) => (
              <li key={s.id}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">{s.id.replace(/_/g, " ")}</span>
                  <span className="text-xs tabular-nums text-muted">{s.count}</span>
                </div>
                <p className="text-xs text-black/45">
                  {s.top_themes.map((t) => t.label).join(" · ") || "—"}
                </p>
              </li>
            ))}
          </ul>
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
              {holdout ? (
                <>
                  {holdout.coded_pairs} documents coded by hand without seeing the model&apos;s
                  label: {pct(holdout.raw_agreement)} raw agreement, {pct(holdout.expected_by_chance)}{" "}
                  expected by chance, κ = {holdout.cohens_kappa} ({holdout.interpretation}).
                </>
              ) : (
                <>
                  Sheet generated but not yet coded. Run{" "}
                  <code>node scripts/discovery/4-holdout.mjs</code>.
                </>
              )}
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
