# Business case

## Read this first — what is and isn't grounded

Every input below is labelled:

- **[R]** from our own research (survey n=26, interviews n=6, corpus n=799)
- **[A]** an assumption we made, with the reasoning stated
- **[?]** requires internal data we do not have

**We have no access to Blinkit's traffic, margins, or inventory.** No figure
here is sourced from the company. The model is therefore built to be *checked
and re-run*, not to produce a headline number — the sensitivity table matters
more than any single cell, and every **[?]** is a question we would ask in week
one rather than a gap we have papered over.

---

## 1. What we are moving

**North Star:** share of Monthly Active Customers who purchase from at least one
new category in a calendar month.

The metric is **binary per customer per month**. A customer who adds three new
categories counts once. Breadth is tracked as a secondary indicator because it
distinguishes a one-off trial from a formed habit, but it is not the target.

**Baseline: ~50% [R]** — survey Q6, share who tried a new category within the
last month.

Two caveats that cut against us and are load-bearing:

1. **Self-reported and self-selected.** 84% of respondents are under 35 and
   recruited through a personal network. Real platform baseline is likely
   *lower*, which increases headroom — but we should not claim that until it is
   measured. **[?]**
2. **This narrows the assignment's premise.** If half the base already explores
   monthly, the addressable population is the other half, not everyone. We are
   optimising a 50% problem, not a 100% one.

---

## 2. Why this is worth doing at all

**Breadth is genuinely narrow. [R]** 54% of respondents buy from only 2–3
categories a month; 8% from a single category. The distribution, not the
average, is the opportunity: moving a 2-category customer to 3 is a 50%
increase in their reasons to open the app.

**The trigger is under-used. [R]** 46% of out-of-basket purchases were prompted
by an occasion (festival 31%, hosting 12%, season 4%). In-app recommendations
prompted **8%**. The platform is leaning on its weakest lever and ignoring its
strongest.

**Occasion beats discount on unit economics. [R + A]** 19% of out-of-basket
buying was prompted by a deal. Discount-led exploration buys the same behaviour
by giving away margin on every unit, every time, and produces no durable habit
once withdrawn. An occasion trigger costs a suggestion slot. If both convert at
similar rates **[?]**, occasion-triggered adoption is strictly cheaper.

---

## 3. The model

Deliberately simple, so each input can be challenged.

| Input | Value | Source |
|---|---|---|
| Monthly Active Customers | **M** | **[?]** internal |
| Baseline adoption | 50% | **[R]** survey Q6 |
| Sessions where an occasion is inferred | 25% | **[A]** conservative vs the 46% recall figure; a live trigger will fire less often than a remembered one |
| Suggestion → trial conversion | 3–8% | **[A]** typical range for in-context merchandising; **must be replaced with measured data** |
| Contribution margin, new categories | higher than Groceries | **[?]** Pet / Baby / PersonalCare / Wellness are the categories the MVP pushes into; directionally higher than staples, magnitude unknown |
| Retention effect of +1 category | positive | **[A]** widely held in quick commerce; **we have not measured it and it carries most of the value** |

**Incremental adopters per month = M × 25% × conversion.**

| Scenario | Trigger | Conversion | Incremental adopters | Adoption lift |
|---|---|---|---|---|
| Conservative | 20% | 3% | 0.6% of M | +0.6pp |
| Base | 25% | 5% | 1.25% of M | +1.25pp |
| Optimistic | 30% | 8% | 2.4% of M | +2.4pp |

**Read this honestly: even the optimistic case is a ~2pp move on a 50%
baseline.** This is an incremental growth feature, not a step change. Anyone
presenting it as transformational is overselling it.

**Where the real value sits, and why we can't size it:** the case rests on
whether an adopted category *persists* and lifts retention. That is the **[A]**
we cannot test without platform data, and it is the single input that would most
change the answer. We would rather say so than model it with an invented
retention curve.

---

## 4. Costs

| Cost | Estimate | Note |
|---|---|---|
| Build | 3–4 engineer-weeks | Inference, suggestion surface, feedback loop; the prototype exists |
| Inference | Near zero | The deterministic matcher passes 12/12 golden cases; the LLM has never beaten it. **This does not need an LLM to ship** |
| Ongoing | Occasion catalog curation | 6 occasions, evidence-mapped, quarterly review |
| **Opportunity cost** | **The real cost** | The same weeks spent on delivery reliability or out-of-stock would address themes with n=123 and n=105 in the corpus, versus n=8 for habitual purchasing |

That last row is the strongest argument *against* this project and it belongs in
the case. The corpus says users complain about convenience, quality, pricing and
support — not about category discovery. **This feature wins on strategic
alignment with the stated goal, not on share of voice.**

---

## 5. Guardrails — what would make us kill it

| Metric | Threshold | Why |
|---|---|---|
| AOV | No decline | Suggestions must add, not substitute |
| Session duration | No material increase | Rhea: *"only if it doesn't slow me down"* **[R]** |
| Suggestion dismiss rate | < 40% | Nikhil: *"if they're obviously trying to sell me more"* **[R]** |
| Uninstall rate | No increase | Annoyance is a retention risk |
| Support contacts | No increase | Wrong suggestions create tickets |
| Return rate, new categories | No material increase | Trial without fit is a cost, not a win |

The dismiss-rate guardrail cannot currently be measured: the feedback event enum
is `tried | repeat` with no rejection state. **That instrumentation is a
prerequisite for launch, not a nice-to-have.**

---

## 6. Feasibility questions we cannot answer from outside

1. **Dark-store SKU depth [?]** — starter packs require per-store inventory. A
   ₹149 trial pack is worthless if the local store stocks only the 1 kg bag.
   This could invalidate the core mechanic and is the first question to ask.
2. **Margin mix by category [?]** — the value depends on *which* categories get
   adopted.
3. **Cannibalisation [?]** — is a new-category purchase incremental, or does it
   displace spend in the same basket?
4. **Existing recommendation surfaces [?]** — what already occupies this slot,
   and what does it earn today?

Any one of these could change the recommendation. They are listed rather than
assumed away.

---

## 7. Recommendation

**Build the smallest version and test it.** The mechanism has real support (46%
occasion-driven out-of-basket buying), the prototype exists, and inference does
not require an LLM. But the sizing rests on two unmeasured assumptions —
conversion and retention — so this warrants an experiment, not a rollout.

If dark-store SKU depth cannot support starter packs, **stop**: the trust
mechanism depends on them, and it is already the least-endorsed part of the
concept (42% top-2 box **[R]**).
