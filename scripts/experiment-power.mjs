/**
 * Sample size and runtime for the new-category adoption experiment.
 *   node scripts/experiment-power.mjs
 *
 * Two-proportion test, two-sided, alpha 0.05, power 0.80:
 *   n per arm = 2 (z_a/2 + z_b)^2 * p(1-p) / delta^2
 *
 * Baseline p comes from our own survey (Q6): the share who tried a new category
 * within the last month. It is self-reported and self-selected, so the real
 * platform baseline is likely lower — which makes the sample sizes below an
 * upper bound on required n for a given absolute lift, since p(1-p) is maximal
 * at p=0.5. That direction is stated because it favours us, and should not be
 * quietly relied on.
 */
import { readFileSync, existsSync } from "node:fs";

const Z_ALPHA = 1.959964; // two-sided 0.05
const Z_BETA = 0.841621; // power 0.80

const survey = existsSync("data/survey.json")
  ? JSON.parse(readFileSync("data/survey.json", "utf8"))
  : null;
const p = survey?.north_star_baseline?.share ?? 0.5;

const perArm = (delta) =>
  Math.ceil((2 * (Z_ALPHA + Z_BETA) ** 2 * p * (1 - p)) / delta ** 2);

// Exposure: only sessions where an occasion is actually inferred can be
// affected. Everyone else is diluted control. Survey Q11 says 46% of
// out-of-basket buying is occasion-driven; we use a deliberately conservative
// share of sessions that will trigger at all.
const TRIGGER_RATE = 0.25;

console.log(`baseline p = ${(p * 100).toFixed(0)}%  (survey Q6, self-reported upper bound)`);
console.log(`alpha 0.05 two-sided · power 0.80\n`);
console.log(`  MDE(abs)  rel lift   n/arm     total    exposed n/arm @ ${TRIGGER_RATE * 100}% trigger`);
for (const delta of [0.01, 0.02, 0.03, 0.05]) {
  const n = perArm(delta);
  const rel = ((delta / p) * 100).toFixed(0);
  console.log(
    `   ${(delta * 100).toFixed(0).padStart(2)}pp      ${String(rel).padStart(3)}%  ` +
      `${String(n).padStart(7)}  ${String(n * 2).padStart(8)}    ${String(Math.ceil(n / TRIGGER_RATE)).padStart(9)}`,
  );
}

// Runtime given a daily eligible population. The metric is monthly by
// definition, so the floor is one full month regardless of how fast n accrues.
const DAILY_ELIGIBLE = [50_000, 200_000, 500_000];
console.log(`\nruntime at 3pp MDE (n/arm ${perArm(0.03).toLocaleString()}), 50/50 split`);
for (const d of DAILY_ELIGIBLE) {
  const days = Math.ceil((perArm(0.03) * 2) / d);
  console.log(
    `  ${d.toLocaleString().padStart(9)} eligible/day -> ${String(days).padStart(2)} days to accrue` +
      `, but run 28 days minimum (metric is monthly)`,
  );
}
console.log(
  `\nNote: DAILY_ELIGIBLE values are illustrative. Replace with the real figure` +
    `\nbefore quoting a runtime — we have no access to platform traffic.`,
);
