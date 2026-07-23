# Weight sensitivity — how much do our chosen numbers matter?

Reproduce: `node scripts/discovery/6-sensitivity.mjs` (no LLM calls). Raw output
in `data/sensitivity.json`.

The opportunity and strategic-fit weights are round numbers we picked. This
tests whether the conclusions depend on them, across **120 weightings** where
each weight is held at ≥0.10 and the three sum to 1.

All figures below are **post codebook-merge** (13 themes). Section 3 records
what the merge changed, including a claim it broke.

---

## 1. The opportunity score is fragile. This is a real weakness.

| Measure | Result |
|---|---|
| Top theme unchanged across weightings | 70% |
| Top-3 set unchanged | **62%** |
| Spearman vs baseline | mean 0.902, **worst 0.399** |

"Value of Convenience and Speed" ranks anywhere from **1st to 10th** depending
on the weights; "Payment, Cancellation and Refunds" swings 5th to 11th. The
merge improved this (the worst case was 0.338 across 18 themes) but did not fix
it.

**What this means:** any statement of the form *"theme X is the top opportunity"*
is not safe. The ordering is an artefact of weights we chose without
justification. We are reporting this rather than quietly re-tuning until it
looks stable, and the ranking on `/discovery` should be read as indicative, not
as a result.

## 2. The strategic-fit score is robust

| Measure | Result |
|---|---|
| Top theme unchanged | **99%** |
| Spearman vs baseline | mean **0.979**, worst 0.909 |
| Top-3 set unchanged | 55% |

The top of the ranking is near-immovable; the 2nd and 3rd places shuffle among
context themes whose fit scores are all within 0.09 of each other, which is why
the top-3 figure is lower than the correlation suggests. Ties near zero are not
a meaningful ordering.

Strategic fit survives re-weighting because one component (the `core` flag) is
binary and dominates. That is also its limitation: it inherits the core/context
judgement. That judgement is now made by a stated rule applied uniformly
(`scripts/discovery/7-merge-codebook.mjs`) rather than case by case, which is
checkable — but it is still a judgement.

## 3. What survived the codebook merge, and what did not

Re-run after merging near-duplicate themes (18 → 13) and re-applying the
core/context rule uniformly. **Two conclusions moved in opposite directions, and
both are reported.**

| Conclusion | Before merge | After merge |
|---|---|---|
| A `context` theme tops raw opportunity | 42% | **100%** |
| A `core` theme tops strategic priority | 100% | **54%** |

**The claim that got stronger.** "The loudest themes are operational" now holds
under *every* weighting. Before the merge it held only 42% of the time, because
*Value of Convenience and Speed* (n=123) had been open-coded `core` despite
being about the platform's value proposition. Correcting that flag fixed it.

**The claim that got weaker, and we are withdrawing it.** "A core theme leads on
strategic priority" is now a coin flip. The cause is the same correction:
*Product Quality Concerns* (n=105) moved core → context, and its residual fit
(0.09) multiplied by its large raw score competes with a small core theme's high
fit. **We no longer claim the priority ranking is robust.**

## 4. The claim that replaces it — and it is stronger

Strategic fit **separates core from context completely**, with no overlap:

| | Fit scores |
|---|---|
| Core themes | 0.65, 0.52 |
| Context themes | 0.09, 0.06, 0.03, 0.02, 0.01, 0.01, 0.01, 0.00, 0.00, 0.00 |

**Gap between the lowest core and the highest context theme: 0.43.** The axis
does what it was built to do — it tells exploration-relevant themes apart from
operational ones — even though the *ordering* it produces after multiplying by
raw score is not stable. Report the separation, not the ranking.

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
   magnitude band. Still true after the merge.
2. ~~Merge the near-duplicate themes and re-review the core/context flags~~ —
   **done**, 18 → 13 themes, flags reassigned by a stated rule. This section is
   kept rather than deleted so the sequence is visible: the merge was decided
   before the kappa was scored, not after.
3. Raise the confidence floor only if the hold-out shows the model's confidence
   correlates with agreement. Raising it now would be theatre.
4. Report the core/context **separation** (0.43 gap, no overlap) rather than the
   strategic-priority ranking, which the merge showed is not stable.
