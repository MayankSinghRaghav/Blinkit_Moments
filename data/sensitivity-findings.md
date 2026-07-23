# Weight sensitivity — how much do our chosen numbers matter?

Reproduce: `node scripts/discovery/6-sensitivity.mjs` (no LLM calls). Raw output
in `data/sensitivity.json`.

The opportunity and strategic-fit weights are round numbers we picked. This
tests whether the conclusions depend on them, across **120 weightings** where
each weight is held at ≥0.10 and the three sum to 1.

---

## 1. The opportunity score is fragile. This is a real weakness.

| Measure | Result |
|---|---|
| Top theme unchanged across weightings | **29%** |
| Top-3 set unchanged | 59% |
| Spearman vs baseline | mean 0.825, **worst 0.338** |

"Value of Convenience and Speed" ranks anywhere from **1st to 15th** depending
on the weights. "Convenience as Primary Driver" swings 2nd to 16th.

**What this means:** any statement of the form *"theme X is the top opportunity"*
is not safe. The ordering is an artefact of weights we chose without
justification. We are reporting this rather than quietly re-tuning until it
looks stable, and the ranking on `/discovery` should be read as indicative, not
as a result.

## 2. The strategic-fit score is robust

| Measure | Result |
|---|---|
| Top theme unchanged | **83%** |
| Top-3 set unchanged | **95%** |
| Spearman vs baseline | mean **0.97**, worst 0.907 |

Strategic fit survives re-weighting because one component (the open-coded `core`
flag) is binary and dominates. That is also its limitation: it inherits whatever
the open coder decided, and the coder's `core`/`context` split was made in a
single pass without review.

## 3. The load-bearing conclusion holds at every weighting

> **A `core` theme tops strategic priority in 100% of the 120 weightings tested.**

This is the one that matters. The project's claim is not "theme X is biggest" —
it is that ranking by share of voice and ranking by fit with the goal produce
*different* orderings, and that the second is the one aligned to the brief. That
conclusion does not depend on the weights at all.

## 4. A claim we have been making is NOT robust — correcting it

We have said that pricing, delivery and support **outrank every exploration
theme on raw share of voice**. Across the weight grid, a `context` theme tops
raw opportunity only **42%** of the time.

The reason is a labelling problem, not a scoring one: the largest theme in the
corpus, *Value of Convenience and Speed* (n=123), was open-coded as **`core`**.
It is about the platform's value proposition, not about category exploration.
With it flagged core, "context always wins on raw" is simply false.

**Action:** this belongs in the codebook merge (see `HANDOFF.md`). Until it is
resolved, the "context outranks core" phrasing should be softened to *"the
loudest themes are operational"* — which is true regardless of the flag.

## 5. The confidence floor is currently doing nothing

| Floor | Accepted | Rejected as low-confidence |
|---|---|---|
| 0.3 | 799 | 0 |
| 0.5 (**ours**) | 799 | **0** |
| 0.7 | 793 | 6 |
| 0.8 | 720 | 79 |

At our chosen floor of 0.5, **zero codes are rejected.** The model almost never
reports low confidence, so the threshold is decorative. Every rejection in our
counters (31 documents) comes from the model returning `none`, not from the
confidence filter.

Two honest readings, and we cannot distinguish them from this data alone:

1. The coder is genuinely confident — plausible, since the themes are broad.
2. **Self-reported LLM confidence is poorly calibrated** and clusters high
   regardless of actual accuracy. This is well documented in the literature.

The hold-out κ is the only thing that can tell these apart. Until it is scored,
the confidence figures on `/discovery` should not be read as a quality signal.

---

## What we would change

1. Stop presenting the opportunity ranking as an ordering; present it as a
   magnitude band.
2. Merge the near-duplicate themes and re-review the `core`/`context` flags —
   particularly *Value of Convenience and Speed*.
3. Raise the confidence floor only if the hold-out shows the model's confidence
   correlates with agreement. Raising it now would be theatre.
