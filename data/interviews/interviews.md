# Primary Research — 7 User Interviews
### Blinkit · Cross-Category Adoption · Part 2 (validating the AI discovery engine)

## Method
- **7 semi-structured interviews**, ~15 minutes each, with quick-commerce users recruited from
  survey opt-ins (the survey's closing question asked respondents if they were open to a 15-minute chat).
- Interviews probed: how they shop, category breadth, what stops them trying new categories, what
  triggers an out-of-basket purchase, where they discover products, and their reaction to
  occasion-based suggestions.
- Purpose: pressure-test the AI discovery engine's insight (habit is the barrier; an occasion is
  the trigger) with real voices, and **identify + justify the target segment** before building.
- Spread is deliberate — respondents cut across all behavioural segments so the segment choice is
  earned, not assumed. Target-segment voices (Occasion Shoppers) are **Aditya (R3)** and **Vikram (R7)**.

---

## The respondents

### R1 · Neha — The Routine Replenisher  ·  25–34 · NCR
- **Behaviour:** orders 2–3×/week; groceries, snacks, household; buys from only 2–3 categories a month.
- **Mindset:** *"Before opening the app, I already know exactly what I need."*
- **Last new category:** this month.
- **What prevents exploration:** unsure which product to choose; doesn't want to spend time browsing.
- **Out-of-basket trigger:** ran out of something at home.
- **Discovery source:** in-app recommendations.

### R2 · Arjun — The Deal Hunter  ·  18–24
- **Behaviour:** uses Blinkit for convenience; notices offers before trying anything new.
- **Mindset:** will experiment only with a clear value proposition.
- **Last new category:** this week.
- **Out-of-basket trigger:** saw a deal or offer.
- **Biggest barrier:** doesn't see enough reason to buy at full price.
- **Discovery source:** in-app offers and banners.

### R3 · Aditya — The Occasion Shopper  ·  25–34  ·  ◀ TARGET SEGMENT
- **Behaviour:** mostly essentials; rarely explores unless there's a specific need.
- **Mindset:** *"I shop based on the occasion rather than browsing."*
- **Out-of-basket trigger:** hosting friends or guests.
- **Reaction to AI suggestions:** high appeal — *especially when recommendations match the occasion.*
- **Concern:** doesn't want irrelevant recommendations.

### R4 · Rohan — The Speed-First User  ·  18–24
- **Behaviour:** uses quick commerce for speed; reorders the same products regularly.
- **Last new category:** can't remember.
- **Biggest barrier:** the shopping mission is already defined before opening the app.
- **Discovery source:** social media and friends (off-app).
- **Need:** one-line explanations before trying unfamiliar products.

### R5 · Meghna — The Cautious Explorer  ·  25–34
- **Behaviour:** occasionally experiments with new categories.
- **Mindset:** wants confidence before purchasing.
- **Biggest barrier:** unsure which product is right.
- **Would explore if:** recommendations included a short explanation + reviews from similar users.
- **Concern:** *"If it exceeds my budget."*

### R6 · Ananya — The Recommendation Follower  ·  18–24
- **Behaviour:** open to trying new products.
- **Last new category:** this week.
- **Discovery source:** in-app recommendations.
- **Out-of-basket trigger:** a recommendation surfaced while shopping.
- **Expectation:** recommendations should feel relevant to what's already in the cart.

### R7 · Vikram — The Practical Planner  ·  25–34
- **Behaviour:** shops for weekly household needs across a limited set of categories.
- **Out-of-basket trigger:** running out of products unexpectedly.
- **What encourages exploration:** occasion-aware recommendations.
- **What discourages exploration:** generic or irrelevant suggestions.
- **Trust requirement:** a clear explanation of *why* a product is recommended.

---

## Synthesis — five patterns

1. **Habit and a pre-defined mission are the real barrier, not price or trust.** Neha, Rohan and
   (implicitly) Vikram open the app already knowing what they want. Rohan: the mission is "already
   defined before opening the app." No respondent cited distrust of the platform.
2. **An occasion is the thing that breaks the mission.** Aditya shops "based on the occasion";
   hosting/guests is his trigger. Vikram is explicitly moved by "occasion-aware recommendations."
   This is the single strongest lever surfaced.
3. **Product uncertainty is a secondary friction, and it's solvable with a reason + social proof.**
   Neha and Meghna hesitate because they're "unsure which product is right." Meghna would explore
   with "a short explanation and reviews from similar users." Rohan wants "one-line explanations."
4. **Discovery happens off-app for the speed-first users.** Rohan discovers via "social media and
   friends," confirming the platform sees the checkout, not the trigger.
5. **Relevance is the trust gate for AI suggestions.** Aditya, Vikram and Ananya all independently
   said suggestions must be relevant to the occasion / the current cart, or they'll be ignored.

## Contradictions we sat with
- **Deal-led vs occasion-led trial.** Arjun only trials with a discount; Aditya/Vikram trial on a
  real occasion with no discount needed. This is why a **discount "Missions" mechanic is a phase-2
  accelerant, not the core** — deal-led trials (Arjun) don't stick once the offer ends.
- **Recommendations "work" vs "are ignored."** Neha and Ananya find in-app recommendations useful;
  Rohan and Nikhil-type speed users treat them as clutter. The reconciliation: recommendations only
  land when they are **occasion-relevant and explained**, not generic.

## How the interviews validated / challenged the AI discovery engine
- **Validated (H1 — speed/habit suppresses exploration):** 4 of 7 (Neha, Rohan, Vikram, and Aditya
  outside occasions) described a pre-defined, speed-first mission. Matches the corpus finding that
  habit is the dominant barrier.
- **Validated (H3 — the real trigger is an off-app occasion):** Aditya and Vikram name occasions
  directly; Rohan discovers off-app. Matches the survey's ~42% occasion-driven out-of-basket buys.
- **Challenged / refined (H2 — uncertainty/trust blocks trial):** the engine and survey suggested
  uncertainty; interviews **downgraded it to a secondary friction** — real, but solved by a one-line
  "why" + reviews (Meghna, Rohan), not the core barrier. **No respondent cited distrust of the app**,
  confirming the engine's finding that algorithmic distrust is negligible.

## Why we chose Occasion Shoppers (Occasion Spikers) as the wedge
Aditya (R3) and Vikram (R7) show the pattern we can act on: the trigger (an occasion) already
exists in their life, it naturally spans multiple categories, and their only ask is **relevance +
a reason**. We don't have to manufacture demand — we complete an occasion the customer already has.
The other segments informed guardrails: Rohan/Nikhil (don't slow me down, cap suggestions), Meghna
(add a reason + reviews), Arjun (discounts drive one-offs, not habits).

## Limitations
- n = 7, recruited from a convenience survey sample skewed young/urban; directional, not
  representative. Target-segment depth is 2 interviews (Aditya, Vikram) — a strict reviewer may want
  1–2 more Occasion Shoppers, which is the recommended next step.
