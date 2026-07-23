# HANDOFF — read this first, don't re-read the repo

State as of commit after "research: correct the root cause". Written so a fresh
session can act without reconstructing context.

## What this project is

A Product Fellowship submission. Assignment: increase the % of Monthly Active
Customers buying from **at least one new category each month** on a
quick-commerce app. Four parts: (1) AI discovery engine, (2) 5–6 user
interviews, (3) problem definition, (4) deployed AI-native MVP.

Live: https://blinkit-moments.vercel.app · Repo: MayankSinghRaghav/Blinkit_Moments

## THE FINDING (this is the whole project — do not re-derive it)

**Barrier = habit. Trigger that breaks it = occasion.**

| Evidence | Source | Figure |
|---|---|---|
| Habit barrier | Survey Q7, n=26, non-leading | **92%** of respondents |
| Quality uncertainty | Survey Q7 | 19% |
| Price | Survey Q7 | 15% |
| Occasion-driven out-of-basket buying | Survey Q11, behavioural recall | **46%** |
| In-app recommendation as trigger | Survey Q11 | 8% |
| North Star baseline | Survey Q6 | ~50% tried a new category within a month |
| Intent-driven shopping | Interviews | 4 of 6, unprompted |

**The corpus does NOT support the thesis, and this is stated openly on the
site.** 799 coded documents: occasion signals 2.3%, habitual-purchasing theme
n=8, a category-exploration theme appeared once and was rejected by the
cross-source rule. Largest core theme is Product Quality Concerns (n=105).
Explanation offered (as a limitation of the instrument, not proof): public
reviews record failed transactions, not absent ones.

**Two framings already tried and abandoned — do not resurrect:**
1. "Price-risk meets exploration" — refuted; only 40 docs (5%) name trial/risk,
   and price is 15% in the survey.
2. "Quality uncertainty is the root cause" — I recommended this, then the survey
   overturned it. Quality is real but secondary (19% vs 92%).

## Current state by assignment part

| Part | State |
|---|---|
| 1 Discovery engine | 🟡 **830/1284 coded** (quota cut in). 18-theme codebook induced from real data. `/discovery` serves real insights. **454 documents remain** |
| 2 Interviews | ✅ 6 committed in `data/interviews/` with leading-question flags + limitations |
| 2 Survey | ✅ n=26 committed, analysed, `data/survey.json` generated reproducibly |
| 3 Problem definition | ✅ `data/problem-definition.md` — figures provisional at 65% corpus |
| 4 MVP | ✅ Deployed, 4 screens + `/discovery` |

Also written: `data/business-case.md` (sizing, guardrails, kill criteria),
`data/experiment-design.md` (A/B + the 3-arm test that isolates the occasion
framing). Sample sizes from `scripts/experiment-power.mjs`.

## Immediate next actions, in order

1. **Finish coding** (quota resets midnight Pacific):
   `npm run discovery:tag && npm run discovery:analyze` — ~4 calls of 20.
   Resumable and idempotent; already-coded docs are skipped.
2. **Hold-out κ**: `npm run discovery:holdout` → hand-code 60 rows into
   `data/holdout-coded.csv` → `node scripts/discovery/4-holdout.mjs --score`.
   Must be human-coded. `/discovery` shows "—" until it exists.
3. **Deck** — the largest remaining gap. Nothing exists.
4. **Supabase env vars in Vercel** — production is `"store":"in-memory"`,
   so the tracker reads empty across lambdas. USER ACTION, 5 min.
4. **Deck** — none exists. Likely the primary evaluation artifact.

## Product decisions already made from research — don't undo

- **Suggestions capped at 3** (`lib/scoring/index.ts`). Nikhil: "one or two
  useful suggestions, not ten". Comfort dial now changes *which* categories, not
  how many.
- **Occasion catalog realigned** (`lib/occasions/index.ts`), each with an
  `evidence` field: removed `fitness_kickoff` and `baby_arrival` (zero mentions
  across 6 interviews + 26 responses); added `hosting_guests` and `movie_night`
  (both volunteered); `festival_prep` is top-weighted (31%).
  `monsoon_evening` retained but flagged as thinly evidenced.
- **Framing block on `/discovery`** now argues habit→occasion and states the
  corpus null result. All numbers derive from `data/survey.json` +
  `data/insights.json`; none are typed into JSX.

## Known open criticisms (from an independent review)

- Comfort dial has zero research support — **recommended for removal**, not yet
  done.
- No dismiss/negative-feedback path; `feedback` event enum is `tried|repeat`
  only, so rejection is unrepresentable.
- Fabricated social proof (`lib/data/catalog.ts` `proof:` fields) renders in
  `WhyPanel` unlabelled as illustrative.
- "Clustering" is a group-by on an LLM label (`3-analyze.mjs`) — no embeddings.
- 3 of 7 required sources (no forums, no social media — X is paywalled on Apify).
- MVP was committed before the discovery engine — provable from git. Own it in
  the writeup rather than implying otherwise.
- LLM degrades to the deterministic matcher after ~2 production calls (20/day
  free tier). Rules pass 12/12 evals; the LLM has never beaten them.

## Commands

```
npm run discovery:tag        # resumable LLM coding, respects 20/day budget
npm run discovery:analyze    # deterministic, no quota, re-run freely
npm run discovery:holdout    # blind coding sheet → --score for kappa
node scripts/discovery/5-survey.mjs   # regenerate data/survey.json from CSV
npm run eval                 # 12 golden occasion cases, offline
npm run verify:cart          # 14 assertions   npm run verify:quotes  # 32
npm run build && npm run lint
```

## Working agreements

- Work only in `Projects/blinkit-moments`. Never modify `Projects/trove`.
- Never present fixture output as findings. `_fixture.mjs` exists only to test
  the pipeline; the page labels it and withholds κ when insights are fixture.
- Report disconfirming evidence rather than reweighting until it agrees. That
  has already happened twice and is the strongest part of this submission.
