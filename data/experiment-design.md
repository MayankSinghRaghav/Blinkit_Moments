# Experiment design

Sample sizes computed by `scripts/experiment-power.mjs` (re-runnable). Every
other input is labelled **[R]** research, **[A]** assumption, **[?]** needs
internal data.

---

## 1. Hypothesis

> Surfacing 2–3 cross-category suggestions at cart time, framed by an inferred
> occasion and carrying a trust cue, increases the share of customers who
> purchase from at least one new category in a calendar month.

**Falsifiable form — what would prove us wrong:**

- Treatment adoption is not higher than control by ≥1pp after 28 days, **or**
- Dismiss rate exceeds 40%, **or**
- Any guardrail regresses.

We commit to these thresholds before running. The dismiss condition matters
most: **Nikhil is a real user and the feature may simply annoy people.**

---

## 2. Design

| | |
|---|---|
| Type | Two-arm A/B, later a three-arm variant (§7) |
| Unit of randomisation | **Customer**, not session — the metric is monthly per customer, so session-level assignment would contaminate it |
| Split | 50/50 |
| Assignment | Sticky for the full period; hashed on customer ID |
| Eligibility | Customers with ≥1 order in the prior 30 days |

**Control:** current experience, no occasion suggestions.
**Treatment:** occasion inferred at cart time; up to 3 suggestions from
categories not in the basket, each with a why-now line and a trust cue where the
category is high-consideration.

---

## 3. Metrics

**Primary:** share of customers purchasing from ≥1 new category within the
calendar month. "New" = no purchase in that category in the prior 90 days **[A]**
— 90 days chosen so a quarterly-cadence buyer isn't miscounted as a new adopter;
this definition must be fixed before launch and not revisited after seeing data.

**Secondary:** categories per customer per month (breadth); suggestion→add rate;
add→purchase rate; repeat purchase in the new category within 30 days (the
*habit* signal, and the one that decides whether this is worth anything).

**Guardrails:** AOV · session duration · dismiss rate · uninstall · support
contacts · return rate in new categories. Any regression stops the test.

---

## 4. Sample size

Two-proportion test, two-sided α=0.05, power 0.80, baseline p=50% **[R]**.

| MDE (absolute) | Relative lift | n per arm | Total | Exposed n/arm @ 25% trigger **[A]** |
|---|---|---|---|---|
| 1pp | 2% | 39,245 | 78,490 | 156,980 |
| 2pp | 4% | 9,812 | 19,624 | 39,248 |
| **3pp** | **6%** | **4,361** | **8,722** | **17,444** |
| 5pp | 10% | 1,570 | 3,140 | 6,280 |

**We power for 3pp.** The business case's base scenario predicts +1.25pp, which
we would *not* detect at this size — that is deliberate and should be stated
plainly: **we are powering to detect an effect worth shipping, not the effect we
expect.** If the true effect is ~1pp, this test returns null and we should treat
that as a real answer rather than re-running until it turns positive.

At p=0.5 the variance term p(1−p) is at its maximum, so these are upper bounds
on required n. Since our baseline is self-reported and likely overstated, the
real requirement is probably smaller — stated because it favours us.

**Runtime: 28 days minimum**, regardless of how quickly n accrues. The metric is
monthly by definition; a 3-day test cannot measure a monthly behaviour.

---

## 5. Threats to validity

**Seasonality is the serious one. [R]** Festivals are the single largest
out-of-basket trigger at 31%. **Running this across Diwali would inflate the
treatment effect and it would not replicate.** Either run in a
festival-free window, or run long enough to span both and pre-register the split
analysis. This is the mistake most likely to produce a result that looks great
and is worthless.

**Novelty effect. [A]** A new surface draws attention that fades. The 28-day
minimum partially controls for it; week-4 performance should be compared with
week-1 before believing the headline.

**Dilution.** Only ~25% of sessions trigger a suggestion **[A]**. Intent-to-treat
across all assigned customers understates the effect on those actually exposed.
Report **both** ITT (the honest headline) and treatment-on-treated (the
mechanism read).

**Trigger accuracy is a confound.** A wrong occasion is worse than none. Log
inferred occasion vs. actual basket outcome so a null result can be attributed
to either the mechanism or the inference.

**Inventory. [?]** If starter packs are out of stock in some dark stores, those
customers get a degraded treatment. Stratify or exclude.

---

## 6. Decision rules

| Outcome | Action |
|---|---|
| ≥3pp lift, guardrails clean | Ship, then run §7 to isolate the mechanism |
| 1–3pp lift, guardrails clean | Underpowered to confirm. Extend or re-run larger — **do not ship on a non-significant positive** |
| No lift, guardrails clean | Do not ship. The mechanism is wrong, not the execution |
| Any guardrail regression | Stop immediately, regardless of primary |
| Dismiss rate >40% | Stop. The feature annoys more than it helps |

**No peeking.** Analysis at day 28 only; interim looks inflate false positives.
If a guardrail alarm fires, that is a stop decision, not a reason to read the
primary metric early.

---

## 7. The follow-up that actually tests our thesis

The A/B above tests *whether suggestions work*. It does **not** test whether the
**occasion framing** is what makes them work — the specific claim this project
makes. A three-arm test isolates it:

| Arm | Treatment |
|---|---|
| A | Control |
| B | Cross-category suggestions, generic framing ("customers also bought") |
| C | Cross-category suggestions, occasion framing ("for tonight's game") |

**C > B is the only result that supports the thesis.** If B ≈ C, the value is in
cross-category merchandising and the occasion inference — the entire AI
component — is decoration and should be removed.

We would run this second, not first, because it needs a larger sample and there
is no point isolating a mechanism that has not yet shown any effect. But it is
the test that would tell us whether the project's central idea is true.

---

## 8. What we would instrument before launch

1. **A `dismissed` feedback event.** The current enum is `tried | repeat` — the
   dismiss guardrail is unmeasurable today. Blocking.
2. Inferred occasion + confidence logged per session, for post-hoc accuracy.
3. Category-level stock availability at suggestion time.
4. Fallback flag — whether the deterministic matcher or the LLM produced the
   suggestion, so the two can be compared on live outcomes rather than on
   golden cases.
