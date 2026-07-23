# Survey findings — n=26

Instrument: `survey-questions.md`. Raw data: `survey-responses.csv`.

**Read the limitations in `README.md` first.** n=26, self-selected, 84% under 35.
No subgroup analysis is reported because any split produces cells of 4–8.

## The barrier question (Q7) — the one question that could falsify the thesis

Multi-select, non-leading, options competing on equal footing.

| Barrier | n | % |
|---|---|---|
| I open the app already knowing exactly what I need | 19 | **73%** |
| I don't browse — I just search and checkout | 9 | **35%** |
| I'm happy with what I already buy | 7 | **27%** |
| I'm not sure which product is right for me | 5 | 19% |
| It feels expensive / I wait for a deal | 4 | 15% |
| I don't trust the app's suggestions | 1 | 4% |

**The top three are all the same thing: habit.** Intent-driven, search-first,
execute-and-leave. Quality uncertainty is 19%; price is 15%.

This refutes two framings we previously held:

1. **Price-risk is not the barrier.** 15%, sixth by weight of the three
   mechanisms. The "price-risk meets exploration" bridge is dead in the survey
   as well as in the corpus (40 documents, 5%).
2. **Quality uncertainty is real but secondary.** 19% here, and Q9 ("I avoid new
   categories because I'm not sure which product is right") splits 42% disagree
   / 27% neutral / 31% agree. It is a contributing barrier, not the root cause.

## What breaks the habit (Q11) — the strongest finding in the survey

*"Think of the last time you bought something OUTSIDE your usual basket. What
prompted it?"* — behavioural recall, not hypothetical.

| Prompt | n | % |
|---|---|---|
| A festival or celebration | 8 | 31% |
| Ran out of something at home | 7 | 27% |
| Saw a deal or offer | 5 | 19% |
| Hosting / guests coming over | 3 | 12% |
| A recommendation | 2 | 8% |
| Season or weather | 1 | 4% |

**Occasions (festival + hosting + season) account for 47% of out-of-basket
purchases.** Deals account for 19%; in-app recommendations for 8%.

This is the evidential core of the project: habit is the barrier, and an
occasion is the thing that reliably breaks it.

## North Star baseline (Q6)

| Last tried a new category | n | % |
|---|---|---|
| This week | 7 | 27% |
| This month | 6 | 23% |
| A few months ago | 6 | 23% |
| Can't remember | 6 | 23% |
| Never | 1 | 4% |

**~50% tried a new category within the last month.** This is the baseline for
the North Star metric — and it complicates the assignment's premise that users
rarely explore. Headroom is roughly the 50% who did not, not the whole base.
Self-reported and self-selected, so treat as an upper bound.

Breadth is narrow regardless: 54% buy from only 2–3 categories a month, 8% from
just one.

## Where discovery actually happens (Q10)

| First hear about a product | n | % |
|---|---|---|
| Instagram / Reels | 10 | **38%** |
| Inside the app itself | 6 | 23% |
| Friends or family | 5 | 19% |
| Ads | 2 | 8% |
| YouTube / physical store / depends | 3 | 12% |

Corroborates Rhea and Sara. In-app discovery is the second channel, not the
first. This argues against building a browse destination and for injecting
discovery into the existing flow.

## Stated preference (Q12–Q14) — report separately, weight lightly

These questions describe our solution and ask whether people like it. They are
directional at best.

| Question | Top-2 box (4–5) | Note |
|---|---|---|
| Q12 More likely to try if suggested for an occasion | 54% | Warm |
| Q14 Appeal of basket completion for an occasion | 46% | 15% gave the lowest score |
| Q13 One-line reason + reviews would make me more likely | 43% | **50% neutral — the weakest of the three** |

Q13 is worth noting against our own interest: the trust-cue mechanism our MVP
leans on is the *least* endorsed of the three concepts tested. It should not be
presented as validated.

Concerns raised (Q15, verbatim): *"If it exceeds my set budget"*, *"I wont buy
it."*, *"Didn't like it"*, and one respondent found the question unclear.

## Triangulation across all three sources

| Barrier | Corpus (799 coded) | Survey (n=26) | Interviews (n=6) |
|---|---|---|---|
| **Habit / intent-driven shopping** | Not detectable — nobody reviews a purchase they didn't make | **73% / 35% / 27%** | 4 of 6: Rhea, Nikhil, Aditya, Sara |
| Quality uncertainty | Largest core theme, n=105 | 19% | 2 of 6: Meghna, Aditya |
| Price | 86 pricing documents | 15% | 0 of 6 |
| Occasion as trigger | 2.3% of documents | **47% of out-of-basket buys** | 3 of 6: Kabir, Sara, Aditya |

Two independent instruments converge on habit as the barrier and occasion as
the trigger. The corpus is silent on both — consistent with public review
channels capturing failed transactions rather than absent ones, though that
remains a hypothesis about method rather than a finding.
