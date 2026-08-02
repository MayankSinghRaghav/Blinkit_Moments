import type { Bridge, Survey, Theme } from "@/lib/discovery";
import { isDisplayable, type DisplayQuote } from "@/lib/quotes";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const SOURCE_LABEL: Record<string, string> = {
  play_store: "Google Play",
  app_store: "App Store",
  reddit: "Reddit",
};

/**
 * Steel-man the opposite — intellectual honesty made interactive.
 *
 * The project's credibility rests on having considered and rejected the
 * price/trial-risk thesis rather than cherry-picking for the occasion one. This
 * gathers the strongest REAL evidence against our own conclusion — the same
 * coded corpus, cited — then states plainly why we still rejected it. Everything
 * is read from the loaded files; nothing is asserted. Deterministic on purpose:
 * a reviewer can re-open it and get the same case every time, which a chatbot
 * over the corpus could never promise.
 */
export function Steelman({
  bridge,
  survey,
  themes,
}: {
  bridge: Bridge;
  survey: Survey | null;
  themes: Theme[];
}) {
  const grp = (g: string) => survey?.barrier_groups.find((b) => b.group === g);
  const price = grp("price");
  const quality = grp("quality");
  const explore = themes.find((t) => t.id === "lack_of_category_exploration_deterrents");
  const corpusSize = Math.round(bridge.trial_need_docs / (bridge.share_of_coded || 1));

  // counter-evidence: trial-risk verbatims, filtered by the same display bar the
  // themes use (each quote checked against its OWN coded theme)
  const quotes = bridge.quotes
    .filter((q) => isDisplayable(q as DisplayQuote, q.theme))
    .slice(0, 4);

  return (
    <details className="rounded-xl border border-amber-300 bg-amber-50/60">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 text-sm font-bold text-amber-900">
        <span aria-hidden>⚖️</span>
        Steel-man the opposite — the strongest case against our own thesis
        <span className="ml-auto text-[11px] font-medium text-amber-800/70">show the counter-argument</span>
      </summary>

      <div className="space-y-3 border-t border-amber-200 px-5 py-4 text-[13px] leading-relaxed text-black/70">
        <p>
          <strong className="text-ink">The counter-thesis.</strong> The barrier is trial-risk and
          price, not habit — users skip new categories because a first try feels expensive or risky.
          This is the framing we began with and abandoned. Here is the real evidence for it, so you
          can judge whether we talked ourselves out of it.
        </p>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800/80">
            The case for it, from the same data
          </p>
          <ul className="mt-1.5 space-y-1">
            <li className="flex gap-2">
              <span className="font-bold tabular-nums text-ink">{bridge.trial_need_docs}</span>
              <span>
                coded documents ({pct(bridge.share_of_coded)} of {corpusSize}) use trial-risk
                language — <em>trial, sample, unsure, unfamiliar, worth it, first-time</em>.
              </span>
            </li>
            {price && quality && (
              <li className="flex gap-2">
                <span className="font-bold tabular-nums text-ink">{pct(price.share)}</span>
                <span>
                  named price as their barrier and {pct(quality.share)} named product uncertainty
                  (survey, n={survey?.responses}) — both real, competing forces.
                </span>
              </li>
            )}
            {explore && (
              <li className="flex gap-2">
                <span className="font-bold tabular-nums text-ink">{explore.count}</span>
                <span>
                  documents form a theme specifically about category-exploration deterrents — it
                  exists in the corpus, not just in our heads.
                </span>
              </li>
            )}
          </ul>
        </div>

        {quotes.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800/80">
              In their words
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {quotes.map((q, i) => (
                <li key={i} className="rounded-lg bg-white/70 p-2.5 text-[12px] leading-snug">
                  <span className="text-black/75">“{q.quote}”</span>
                  <span className="mt-0.5 block text-[10.5px] text-black/45">
                    {SOURCE_LABEL[q.source] ?? q.source}
                    {q.rating ? ` · ${q.rating}★` : ""} · coded {q.theme.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="rounded-lg bg-white/80 p-3">
          <strong className="text-ink">Why we still rejected it.</strong> In the one question where
          every barrier competes equally, occasion-driven buying{" "}
          {survey && <strong className="text-ink">({pct(survey.occasion_driven.share)})</strong>}{" "}
          dwarfs price {price && <>({pct(price.share)})</>}, and habit leads at{" "}
          {grp("habit") && <strong className="text-ink">{pct(grp("habit")!.share)}</strong>}. The
          trial-risk signal is {pct(bridge.share_of_coded)} of the corpus and the exploration-deterrent
          theme is n={explore?.count ?? 0} — real, but secondary. So the thesis rests on the survey
          and interviews, and we report the corpus as a limitation of the instrument rather than proof.
          We did not reweight the data until it agreed.
        </p>
      </div>
    </details>
  );
}
