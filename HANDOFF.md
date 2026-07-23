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
| 1 Discovery engine | 🟡 **830/1284 coded** (quota cut in). 18-theme codebook induced from real data. `/discovery` serves real insights. **454 documents remain**; codebook has near-duplicate themes to merge before the hold-out |
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
3. **Merge near-duplicate themes** before the hold-out is coded. Open coding
   produced `customer_support_failure` + `poor_customer_support`,
   `delivery_issues` + `delivery_inconsistencies` + `delivery_time_expectations`,
   `pricing_discrepancies` + `pricing_and_fees`. A human coder will coin-flip
   between them and kappa will come out low for a codebook flaw, not a coding
   one. Deterministic, no quota.
4. **Regenerate the deck** after the corpus and kappa land:
   `node scripts/build-deck.mjs` — every figure is read from the data files.
5. **Vercel still reports `"store":"in-memory"`** despite the env vars being
   added. Check they are on the Production environment, names exact, and that a
   deployment has run since. USER ACTION.

## Product decisions already made from research — don't undo

- **Suggestions capped at 3** — `MAX_SUGGESTIONS` in `lib/scoring/index.ts`.
  Nikhil: "one or two useful suggestions, not ten".
- **Comfort dial deleted entirely** — UI, session, store, API, prompt, evals.
  No participant asked for it; two asked for less friction.
- **Dismiss path exists** — `dismissed` event, per-card control, session
  suppression, `dismiss_rate` on the feedback GET. Needed migration 0002.
- **Store writes throw on failure.** They used to swallow the Supabase error and
  return 200, silently losing adoption events. Do not revert that.
- **Occasion catalog realigned** (`lib/occasions/index.ts`), each with an
  `evidence` field: removed `fitness_kickoff` and `baby_arrival` (zero mentions
  across 6 interviews + 26 responses); added `hosting_guests` and `movie_night`
  (both volunteered); `festival_prep` is top-weighted (31%).
  `monsoon_evening` retained but flagged as thinly evidenced.
- **Framing block on `/discovery`** now argues habit→occasion and states the
  corpus null result. All numbers derive from `data/survey.json` +
  `data/insights.json`; none are typed into JSX.

## Known open criticisms (from an independent review)

Closed since: comfort dial removed, dismiss path added, seeded proof labelled,
business case and experiment design written, Part 3 written, deck built.

Still open:
- "Clustering" is a group-by on an LLM label (`3-analyze.mjs`) — no embeddings.
- 3 of 7 required sources (no forums, no social media — X is paywalled on Apify).
- MVP was committed before the discovery engine — provable from git. Own it in
  the writeup rather than implying otherwise.
- LLM degrades to the deterministic matcher after ~2 production calls (20/day
  free tier). Rules pass the golden set; the LLM has never beaten them.
- No inter-coder agreement yet — kappa tile shows "—" until the hold-out is
  hand-coded.

## Commands

```
npm run discovery:tag        # resumable LLM coding, respects 20/day budget
npm run discovery:analyze    # deterministic, no quota, re-run freely
npm run discovery:holdout    # blind coding sheet → --score for kappa
node scripts/discovery/5-survey.mjs   # regenerate data/survey.json from CSV
npm run eval                 # golden occasion cases, offline
node scripts/build-deck.mjs  # regenerate the deck from the data files
npm run verify:cart          # 14 assertions   npm run verify:quotes  # 32
npm run build && npm run lint
```

## Working agreements

- Work only in `Projects/blinkit-moments`. Never modify `Projects/trove`.
- Never present fixture output as findings. `_fixture.mjs` exists only to test
  the pipeline; the page labels it and withholds κ when insights are fixture.
- Report disconfirming evidence rather than reweighting until it agrees. That
  has already happened twice and is the strongest part of this submission.
