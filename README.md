# Blinkit Moments

A quick-commerce prototype where an agent infers the **real-life occasion** behind your
cart ("game night", "monsoon evening in") and completes it across categories you've
**never bought** — each suggestion carrying a *why now* line, a trust cue, and a comfort
dial. An adoption tracker shows trial → repeat across a simulated month.

Prototype only: seeded catalog, no real Blinkit data, no payments, no accounts.

## Run

```bash
npm install && npm run dev
```

Works with **zero environment variables**. Everything is optional:

| Var | Missing → |
|---|---|
| `GEMINI_API_KEY` | Deterministic occasion matcher + template explanations, with a degraded-mode banner |
| `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | In-process adoption store instead of Postgres |

`GET /api/health` reports which path each is on.

## Screens

| Route | What |
|---|---|
| `/` | Cart + occasion banner (shown only at confidence ≥ 0.4) |
| `/moments` | 2–4 new-category suggestions + comfort dial |
| `/why/[itemId]` | Why now / why trust it / why it's a stretch |
| `/tracker` | Adoption ring, `Simulate a month` |

## Evals

```bash
npm run eval
```

Runs `evals/occasion-golden.json` against the deterministic matcher at comfort 0/50/100
(12 cases, offline, no quota). Each case checks: occasion match · no in-basket category
suggested · at least one expected new category · trust cue on every high-consideration
item · the "none" case returns nothing.

`npm run eval:live` runs the same set through `/api/infer-occasion` on a running dev
server, exercising the LLM path.

## Supabase (optional)

```bash
# paste supabase/migrations/0001_init.sql into the SQL editor, then:
npm run db:seed
```

`products` and `occasions` are seeded from `lib/data` and `lib/occasions` — the app reads
them from code; the tables exist so `adoption_events` can reference them.

## North Star

A category counts as **adopted** when it collects ≥ 2 `tried`/`repeat` events *and* the
session didn't start with it. The tracker ring is `adopted / 3`.

## Deploy

Vercel, zero config. Set the two optional key groups in project settings to leave
degraded mode.
