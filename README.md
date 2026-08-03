# Blinkit Moments

A quick-commerce prototype where an agent infers the **real-life occasion** behind your
cart ("game night", "monsoon evening in") and completes it across categories you've
**never bought** — each suggestion carrying a *why now* line and a trust cue. A discovery
engine mines real review corpora to justify the bet; an adoption tracker shows trial →
repeat across a simulated month.

Prototype only: seeded catalog, no real Blinkit transactions, no payments, no accounts.

## Run

```bash
npm install && npm run dev
```

Runs with **zero environment variables** (deterministic fallbacks everywhere). To exercise
the real AI and persistence, set:

| Var | Default / missing → |
|---|---|
| `GEMINI_API_KEY` | **Required for AI.** Missing → deterministic occasion matcher + template explanations, labelled "rule-based fallback". Get a free key at aistudio.google.com. |
| `GEMINI_MODEL` | Occasion-inference model. Default `gemini-2.5-flash`. |
| `GEMINI_ANALYZE_MODEL` | Review-analysis model (higher-quota lite tier). Default `gemini-flash-lite-latest`. NB: the pinned `gemini-2.5-flash-lite` is gated to existing keys and 404s for new ones. |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | In-process adoption store instead of Postgres. |

`GET /api/health` reports which path each is on, plus per-instance inference counters.

Free-tier note: Gemini free quota is low (~10 req/min). On a 429/quota error the app
silently falls back to the deterministic matcher and labels it "rule-based fallback" —
it never crashes, and never claims "AI inference" for a fallback.

## Screens

| Route | What |
|---|---|
| `/` | Shop + occasion banner (shown only at confidence ≥ 0.4) with a source badge + Why? expander |
| `/moments` | The occasion kit (opt-out completion) + a live AI reasoning trace |
| `/why/[itemId]` | Two-sided explainability — why now / why it's a stretch |
| `/tracker` | North-Star ring, `Simulate a month` (auto-seeds cold) |
| `/discovery` | The runnable review-analysis workflow, 6 charts, primary research, steel-man |

## Discovery pipeline

Staged and resumable. The corpus is mined from App Store (Apple RSS, free), Google Play,
and Reddit; community forums (Quora) and social (X/Twitter) are wired as connectors but
not yet ingested (X is paywalled on Apify) — shown honestly on `/discovery`, no faked volume.

```bash
npm run discovery:fetch      # 0-fetch-appstore + 1-normalize (clean, dedupe, language-filter)
npm run discovery:tag        # 2-tag: LLM open+closed coding, resumable, 20 calls/day free tier
npm run discovery:analyze    # 3-analyze: deterministic clustering + scoring → data/insights.json
npm run discovery:holdout    # 4-holdout: blind hold-out → Cohen's kappa
npm run discovery:refresh    # fetch → tag → analyze in one shot
node scripts/discovery/6-sensitivity.mjs   # weight-sensitivity of the scores
```

### The exact LLM prompts

All prompts live in `prompts/*.txt` and are loaded verbatim at runtime.

- **Tagging — open coding** (`prompts/discovery_opencode.txt`): *"You are a product researcher
  doing OPEN CODING on quick-commerce user feedback… Why do users keep buying the same
  categories, and what stops them from trying categories they have never bought?"* Induces a
  theme codebook from a stratified sample.
- **Tagging — closed coding** (`prompts/discovery_classify.txt`): *"You are coding… against a
  FIXED codebook. Assign each document the single best-fitting theme. If nothing fits, use
  'none'."* Applies the codebook to the full corpus; "none" is a valid answer (grounding floor).
- **Live workflow — tag + cluster + score** (`prompts/review_analysis.txt`): tags each pasted
  review with a theme + sentiment, clusters near-duplicates, and scores clusters by size.
  Powers `/api/analyze-reviews` (the "Run the workflow" panel).
- **Occasion inference** (`prompts/occasion_inference.txt`): infers `{occasion, confidence,
  reason, suggestions[]}` from cart + context, grounded only in the input. Powers
  `/api/infer-occasion`. Uses Gemini structured output (`responseSchema`, temp 0.2).

### Clustering + scoring (deterministic, not LLM)

`3-analyze.mjs` groups documents by their assigned theme (a group-by, not embeddings) and
computes two independent axes:

- **opportunity** = normalised (frequency + severity + segment spread) — "share of voice".
- **strategic_fit** ∈ [0,1] = 0.5·core-relevance + 0.3·trial-need + 0.2·new-category — goal
  alignment. Neither axis is tuned to the conclusion; `6-sensitivity.mjs` re-scores across
  many weightings and reports the result against us.

`/discovery` shows the achieved **grounding %** (share of the corpus coded to a theme) and
the **dedup count** (duplicates removed during normalize), both from committed data files.

## Evals

```bash
npm run eval        # 10 golden occasion cases, offline (also the CI gate)
npm run eval:live   # same set through /api/infer-occasion on a running dev server
```

The offline set gates the deterministic baseline the LLM must never regress below. CI runs
typecheck + lint + eval on every push (`.github/workflows/eval.yml`).

## North Star

Primary metric = the assignment's wording: **the share of monthly active customers who buy
from at least one new category each month.** A session crosses it on the first purchase in a
category it didn't already shop. Buying it **≥ 2×** is the adoption-*quality* bar (stickiness),
shown alongside — not the primary definition.

## Supabase (optional)

```bash
# paste supabase/migrations/*.sql into the SQL editor, then:
npm run db:seed
```

## Deploy

Vercel, zero config. Set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL` /
`GEMINI_ANALYZE_MODEL`, `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) in project settings;
without them the app runs in labelled fallback mode.
