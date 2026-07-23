# Part 3 — Problem Definition

**Goal being served:** increase the share of Monthly Active Customers who buy
from at least one new category each month.

**Status of the figures below.** Corpus figures come from 799 coded documents —
65% of the 1,284-document corpus; the remaining 454 are blocked on an LLM quota
and will be coded before submission. Proportions are not expected to move
materially, but every corpus number here should be treated as **provisional**
and re-checked against the final run. Survey (n=26) and interview (n=6) figures
are final.

---

## 1. Target segment

**Routine replenishers in metro India who shop with intent.**

Defined behaviourally, not demographically:

| Attribute | Evidence |
|---|---|
| Orders weekly or more | All 6 interviewees; survey skews frequent |
| Buys from **2–3 categories a month** | 54% of survey respondents; a further 8% buy from just one |
| Opens the app knowing what they want | 73% of survey respondents |
| Searches rather than browses | 35% |

This is deliberately **not** the segment we started with. The original framing
targeted "Occasion Spikers" as a discovered behavioural segment. The corpus does
not support that: the cross-cut resolves to 18 documents (2%), and 90% of it is
just the `new_life_stage` persona relabelled. **We dropped it.** The segment
above is the one the evidence actually describes.

**Who this excludes, and we do not serve:** Nikhil — *"I just want to finish
shopping quickly"* — represents users who do not want discovery at any price.
He is a real segment, and the honest position is that this feature is not for
him beyond a strict suggestion cap.

---

## 2. Root cause

**Habit, not price and not ignorance.** Users have compiled a mental list before
the app opens; the session is execution, not shopping.

The survey's barrier question is the one place every candidate barrier competed
on equal footing, unprompted:

| Barrier | Share of respondents |
|---|---|
| **Habit** (already know what I need / don't browse / happy with basket) | **92%** |
| Quality uncertainty (not sure which product is right) | 19% |
| Price (feels expensive / wait for a deal) | 15% |
| Distrust of the app's suggestions | 4% |

Four of six interviewees described this without being asked:

> *"I already know exactly what I need before opening the app."* — Rhea
> *"I searched directly because I wanted to place the order quickly."* — Aditya
> *"I just want to finish shopping quickly."* — Nikhil
> *"Blinkit feels transactional."* — Sara

**What actually breaks the habit is an occasion.** Asked what prompted their
last purchase outside the usual basket — behavioural recall, not a hypothetical:

| Trigger | Share |
|---|---|
| Festival or celebration | 31% |
| Ran out of something at home | 27% |
| Saw a deal or offer | 19% |
| Hosting / guests coming over | 12% |
| A recommendation | 8% |
| Season or weather | 4% |

**Occasions account for 46% of out-of-basket purchasing. In-app recommendations
account for 8%.** That ratio is the case for the intervention: the platform is
under-using the strongest trigger it has, and over-using the weakest.

### Two root causes we tested and discarded

1. **Price risk.** 15% in the survey, 0 of 6 interviews, and only 40 of 799
   coded documents name a trial or risk need at all. We previously argued
   price-risk and exploration met at "fear of wasting money"; the data refutes
   it and we have removed the claim rather than reweighting toward it.
2. **Quality uncertainty as the *root*.** Real but secondary: 19% in the survey,
   2 of 6 interviews. It is the largest theme in the corpus (Product Quality
   Concerns, n=105), which is why we initially anchored on it — and why the
   survey's non-leading barrier question was necessary to correct us.

---

## 3. Existing workarounds

Users already solve this — just not inside the app.

| Workaround | Evidence |
|---|---|
| **Leave the platform to research** | Meghna: *"Google and YouTube."* |
| **Discover on Instagram, buy elsewhere** | 39% first hear about products on Instagram/Reels vs **23% inside the app**; Rhea: *"If I wanted to browse, I'd use Amazon or Instagram."* |
| **Ask people** | 19% first hear from friends or family |
| **Assemble occasion baskets manually, incompletely** | Kabir: *"I buy beer, chips, and soft drinks separately. Nobody tells me what I'm missing."* |

The last one is the gap the MVP addresses. The others are the competitive
reality: **in-app discovery is the second channel, not the first**, and any
solution that requires browsing loses to Instagram before it starts.

---

## 4. Why solving this creates user value

Not "users want to explore." Most say the opposite. The value is narrower:

1. **Removes a research errand.** Meghna left the app for Google and YouTube to
   answer one question. Answering it in-flow saves the trip.
2. **Completes a basket the user already knows is incomplete.** Kabir's problem
   is not that he lacks appetite for new categories; it is that nobody surfaces
   what he is missing at the moment he could act.
3. **Costs nothing when wrong** — provided the suggestion is capped and
   dismissible. Nikhil's tolerance is *"one or two useful suggestions. Not
   ten."*

**Evidence against us, recorded:** the trust-cue mechanism the MVP leans on
(a one-line reason plus peer reviews) is the *least* endorsed of the three
concepts tested — 42% top-2 box, 50% neutral. We are not claiming it validated.

---

## 5. Why solving this makes business sense

**Baseline.** 50% of survey respondents tried a new category within the last
month. Self-reported and self-selected, so treat it as an upper bound — the
addressable headroom is roughly the other 50%, not the whole base. *This
narrows the assignment's premise and we state it rather than assume a bigger
prize.*

**Mechanism.** Category breadth is the lever: 54% of respondents buy from only
2–3 categories a month. Moving a customer from 2 categories to 3 raises basket
diversity, and new-category adoption is a leading indicator of retention in
quick commerce because it increases the number of reasons to open the app.

**Why occasion-triggered is cheaper than the alternatives.** A festival or a
hosting event is a *known, dated, predictable* moment. It requires no new
personalisation infrastructure — the trigger is calendar plus basket context.
Compare with 19% who acted on a deal: discount-led exploration buys the same
behaviour by giving away margin, and does not build a habit.

**Constraints that would decide feasibility, and are unresolved:**

- **Dark-store SKU depth.** Starter packs require per-store inventory. A ₹149
  trial pack is worthless if the local store only holds the 1 kg bag. This is
  the first question to answer before build, and we cannot answer it from
  outside.
- **Margin mix.** Pet, Baby, PersonalCare and Wellness carry different
  contribution margins from Groceries; the value of the shift depends on which
  categories get adopted, which we have not modelled.
- **Guardrails.** AOV, delivery time, uninstall rate and support contacts must
  be watched — a suggestion surface that annoys is a retention risk, and Nikhil
  is the proof that the risk is real.

---

## 6. How primary research validated or challenged the AI discovery engine

This is the part the assignment asks to be demonstrated, and the honest answer
is that **the engine and the primary research disagreed, and the research won.**

| Claim | Discovery engine (799 docs) | Survey (n=26) | Interviews (n=6) | Verdict |
|---|---|---|---|---|
| Habit is the barrier | Not detectable | **92%** | 4 of 6, unprompted | **Validated by research; engine silent** |
| Occasions break the habit | 2% of documents | **46%** of out-of-basket buys | 3 of 6 | **Challenged by engine, upheld by research** |
| Price risk is the barrier | 40 docs (5%) name trial/risk | 15% | 0 of 6 | **Refuted by all three — claim withdrawn** |
| Quality uncertainty is the root cause | Largest core theme, n=105 | 19% | 2 of 6 | **Demoted to secondary** |
| Category exploration is discussed publicly | Theme appeared **once**, rejected by our own cross-source rule | — | — | **Refuted** |

**What the engine got wrong, and why.** It surfaced operational themes almost
exclusively — quality, delivery, pricing, support, payments. The habitual-
purchasing theme is n=8; a theme explicitly about category-exploration
deterrents appeared once, in a single source, and was rejected by the ≥2-source
validity rule we wrote *before* knowing what it would reject.

**Our explanation, offered as a limitation rather than a rescue:** nobody writes
a public review about the pet food they did not buy. Review and forum channels
capture *failed transactions*, not *absent* ones. If that is right, public
feedback is structurally the wrong instrument for detecting non-purchase
behaviour, and the engine's null result is informative about the method rather
than about the world.

We flag the risk in that reading: it is unfalsifiable as stated, and it happens
to be convenient for us. It should not be presented as a finding. What can be
said without qualification is that **the primary research changed our conclusion
twice** — first away from price risk, then away from quality uncertainty — and
both corrections are recorded in the repository history.

---

## 7. What changed in the product because of this

| Change | Evidence | Where |
|---|---|---|
| Suggestions capped at 3 | Nikhil: *"one or two useful suggestions. Not ten"* | `lib/scoring/index.ts` |
| `fitness_kickoff`, `baby_arrival` removed | 0 mentions across 6 interviews + 26 responses | `lib/occasions/index.ts` |
| `hosting_guests`, `movie_night` added | Volunteered by Kabir, Aditya, Sara | `lib/occasions/index.ts` |
| `festival_prep` weighted highest | 31%, the largest single trigger | `lib/occasions/index.ts` |
| "Occasion Spikers" segment dropped | Resolves to 18 docs, 90% overlap with an existing persona | — |
| Occasion inference demoted from headline to mechanism | Occasion signals are 2% of the corpus | `/discovery` framing |

## 8. Known gaps in this definition

- Corpus is 65% coded; figures provisional.
- No inter-coder agreement (κ) yet — the hold-out sheet is generated but
  unscored, so the coding quality behind every corpus figure is unverified.
- Survey n=26, self-selected, 84% under 35. No non-metro or price-sensitive
  respondents; the `deal_seeker` persona has zero representation.
- Several interview questions were leading; only unprompted material is cited
  as support above.
- Dark-store inventory feasibility and margin mix are unmodelled.
