# Primary research

Two instruments: a survey (n=26) and semi-structured interviews (n=6). This file
records what was done, what it supports, and — more usefully — where it is weak.

## Participants

| # | Name | Age | City | Role | Order frequency | Segment |
|---|---|---|---|---|---|---|
| 1 | Aditya | 29 | Bengaluru | Software engineer | 3–4×/week | urban_professional |
| 2 | Rhea | 26 | Gurugram | Marketing executive | Daily | power_user |
| 3 | Meghna | 32 | Noida | New pet owner | 2×/week | **new_life_stage** |
| 4 | Kabir | 35 | Mumbai | Consultant | Weekly | urban_professional |
| 5 | Sara | 24 | Delhi | Content creator | 2–3×/week | urban_professional |
| 6 | Nikhil | 38 | Pune | Finance professional | Weekly | routine_replenisher |

## Limitations — read these before quoting anything below

These are stated up front because they bound every claim that follows.

1. **Several questions were leading.** "If Blinkit understood the occasion, would
   that help?" supplies its own answer. Kabir's "Definitely" and Aditya's
   suggested copy format are therefore weak evidence for the feature, however
   quotable. Only the unprompted material should carry weight.
2. **All six support the hypothesis.** In a genuine test some participants
   disagree. Nikhil comes closest, and he still lands on "one or two useful
   suggestions" — acceptance with a constraint. Treat 6/6 agreement as a signal
   about the questions, not about the world.
3. **Sample skew.** All urban, all 24–38, all white-collar. No non-metro, no
   older users, no price-sensitive respondents. The `deal_seeker` segment in our
   own codebook has zero representation.
4. **Recruitment was convenience-based**, not screened against a panel.
5. **Stated preference, not behaviour.** Nobody was asked to show order history.
6. **n=26 survey cannot support subgroup analysis** — any split produces cells of
   4–8. Whole-sample figures only; no crosstabs.

## What the interviews support, and what they do not

**Supported — quality uncertainty as the barrier** (this is the finding that
survived contact with the corpus):

> "I don't want to waste money on something nobody likes." — Aditya
> "I wasn't sure which brand to choose… too many options without much
> explanation." — Meghna

Aditya's arrives *before* any feature was described, which makes it the single
most usable quote in the set.

**Supported — the completion gap**, volunteered without prompting:

> "I buy beer, chips, and soft drinks separately. **Nobody tells me what I'm
> missing.**" — Kabir

**Contradicts our design** — three separate constraints from participants:

| Constraint | Source | What it contradicts |
|---|---|---|
| 1–2 suggestions, not more | Nikhil: *"One or two useful suggestions. Not ten."* | `lib/scoring/index.ts` returns up to 4 |
| Must not add latency | Rhea: *"Only if it doesn't slow me down."* | LLM path allows a 20s timeout |
| Discovery happens on Instagram | Rhea, Sara | The premise that in-app discovery is natural |

**Occasions users actually named:** hosting friends, cricket night, movie night,
festivals, new pet. **Nobody mentioned** monsoon, fitness, or a new baby — three
of the six occasions seeded in `lib/occasions`.

## The convergent finding (added after the survey was analysed)

The survey's non-leading barrier question puts **habit at 73% / 35% / 27%**
against quality uncertainty at 19% and price at 15%. Re-reading the interviews
against that, four of six describe habitual, intent-driven, speed-first
shopping — and this was volunteered, not prompted:

> "I already know exactly what I need before opening the app." — Rhea
> "I just want to finish shopping quickly." — Nikhil
> "I searched directly because I wanted to place the order quickly." — Aditya
> "Blinkit feels transactional." — Sara

And the survey's behavioural recall question says occasions account for **47%**
of out-of-basket purchases. Kabir, Sara and Aditya all describe an occasion as
what pulled them outside their usual basket.

**Barrier: habit. Trigger that breaks it: occasion.** Quality uncertainty is a
secondary barrier (19%, and 2 of 6 interviews); price is minor (15%, 0 of 6).

## Where this disagrees with the discovery engine

The corpus (799 coded documents) does **not** support the occasion framing:
occasion signals are 2.3%, the habitual-purchasing theme is n=8, and a
category-exploration theme was rejected by the cross-source rule at n=1.

The interviews say the opposite. The most likely explanation is instrument
mismatch rather than one source being wrong: **nobody writes a public review
about the pet food they didn't buy.** Public feedback captures failed
transactions, not absent ones.

That reading is convenient for us, so it should be held loosely — it is a
hypothesis about method, not a finding. What both sources *do* agree on,
independently, is quality uncertainty: the largest core theme in the corpus
(Product Quality Concerns, n=105) and the barrier two interviewees named
unprompted.

## Transcripts

See `interview-1-aditya.md` … `interview-6-nikhil.md`. Survey questions and
responses in `survey-questions.md` and `survey-responses.csv`.
