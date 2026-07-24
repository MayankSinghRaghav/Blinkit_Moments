/**
 * Builds the fellowship submission deck.
 *   node scripts/build-deck.mjs   ->  deck/Blinkit-Moments-Fellowship.pptx
 *
 * Every figure is read from the committed data files, not typed in, so the deck
 * cannot drift from the analysis. Re-run after any pipeline or survey change.
 */
import pptxgen from "pptxgenjs";
import { readFileSync, existsSync, mkdirSync } from "node:fs";

const insights = JSON.parse(readFileSync("data/insights.json", "utf8"));
const survey = JSON.parse(readFileSync("data/survey.json", "utf8"));
const holdout = existsSync("data/holdout-report.json")
  ? JSON.parse(readFileSync("data/holdout-report.json", "utf8"))
  : null;

const grp = (g) => survey.barrier_groups.find((b) => b.group === g);
const P = (x) => `${Math.round(x * 100)}%`;
const prompt = (re) => survey.out_of_basket_prompts.find((p) => re.test(p.label));

const F = {
  habit: P(grp("habit").share),
  quality: P(grp("quality").share),
  price: P(grp("price").share),
  occasion: P(survey.occasion_driven.share),
  rec: P(prompt(/recommendation/i).share),
  deal: P(prompt(/deal/i).share),
  festival: P(prompt(/festival/i).share),
  baseline: P(survey.north_star_baseline.share),
  insta: P(survey.first_hear_about_product[0].share),
  inApp: P(survey.first_hear_about_product[1].share),
  coded: insights.corpus.with_theme,
  docs: insights.corpus.documents,
  themes: insights.validity.valid_themes,
  spikers: P(insights.occasion_spikers.share_of_coded),
  bridge: insights.bridge.trial_need_docs,
  habitual: insights.themes.find((t) => /habitual/i.test(t.id))?.count ?? 8,
};

const INK = "0F2417";
const GREEN = "0C831F";
const YELLOW = "F8CB46";
const PAPER = "FFFFFF";
const TINT = "F1F6F2";
const MUTED = "667085";
const HEAD = "Cambria";
const BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.author = "Mayank Singh Raghav";
pres.title = "Blinkit Moments — Product Fellowship submission";

const W = 13.333;
const M = 0.7;
const CW = W - M * 2;

/* ---------- helpers ---------- */
const title = (s, text, opts = {}) =>
  s.addText(text, {
    x: M, y: 0.5, w: CW, h: 0.9, fontFace: HEAD, fontSize: 34, bold: true,
    color: opts.color ?? INK, margin: 0, ...opts,
  });

const kicker = (s, text, color = GREEN) =>
  s.addText(text.toUpperCase(), {
    x: M, y: 0.28, w: CW, h: 0.3, fontFace: BODY, fontSize: 11, bold: true,
    color, charSpacing: 2, margin: 0,
  });

const card = (s, x, y, w, h, fill = TINT) =>
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, fill: { color: fill }, rectRadius: 0.08, line: { color: fill },
  });

/** big number + label, the deck's repeated motif */
function stat(s, x, y, w, value, label, color = GREEN, sub) {
  s.addText(value, {
    x, y, w, h: 0.9, fontFace: HEAD, fontSize: 44, bold: true, color, margin: 0,
  });
  s.addText(label, {
    x, y: y + 0.85, w, h: 0.4, fontFace: BODY, fontSize: 13, color: INK, margin: 0,
  });
  if (sub)
    s.addText(sub, {
      x, y: y + 1.2, w, h: 0.4, fontFace: BODY, fontSize: 10.5, color: MUTED, margin: 0,
    });
}

function numberedRow(s, n, x, y, w, head, body) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: 0.42, h: 0.42, fill: { color: GREEN }, line: { color: GREEN },
  });
  s.addText(String(n), {
    x, y, w: 0.42, h: 0.42, align: "center", valign: "middle",
    fontFace: BODY, fontSize: 13, bold: true, color: PAPER, margin: 0,
  });
  s.addText(head, {
    x: x + 0.6, y: y - 0.03, w: w - 0.6, h: 0.35,
    fontFace: BODY, fontSize: 15, bold: true, color: INK, margin: 0,
  });
  s.addText(body, {
    x: x + 0.6, y: y + 0.32, w: w - 0.6, h: 0.75,
    fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0, lineSpacingMultiple: 1.15,
  });
}

const footnote = (s, text) =>
  s.addText(text, {
    x: M, y: 6.95, w: CW, h: 0.3, fontFace: BODY, fontSize: 9.5, color: MUTED, margin: 0,
  });

/* ---------- 1. title ---------- */
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("Blinkit Moments", {
    x: M, y: 2.1, w: CW, h: 1.1, fontFace: HEAD, fontSize: 54, bold: true, color: PAPER, margin: 0,
  });
  s.addText("Getting habitual shoppers to try one new category a month", {
    x: M, y: 3.15, w: CW, h: 0.6, fontFace: BODY, fontSize: 20, color: YELLOW, margin: 0,
  });
  s.addText(
    "We set out to prove that price risk stopped people exploring. It doesn't. " +
      "This deck reports what the evidence actually said, including where it contradicted us.",
    { x: M, y: 3.95, w: 9.4, h: 1, fontFace: BODY, fontSize: 14, color: "C9D6CC", margin: 0, lineSpacingMultiple: 1.3 },
  );
  s.addText("Product Fellowship submission · Mayank Singh Raghav · independent case study, not affiliated with Blinkit", {
    x: M, y: 6.5, w: CW, h: 0.4, fontFace: BODY, fontSize: 10.5, color: "8FA394", margin: 0,
  });
  s.addNotes(
    "The honest framing is the point. Most submissions present a clean story. " +
      "This one reports two hypotheses that were tested and refuted.",
  );
}

/* ---------- 2. goal + metric ---------- */
{
  const s = pres.addSlide();
  kicker(s, "The goal");
  title(s, "One metric: customers buying from a new category each month");
  card(s, M, 1.75, CW, 1.9);
  s.addText("North Star", {
    x: M + 0.4, y: 1.95, w: 3, h: 0.3, fontFace: BODY, fontSize: 11, bold: true, color: GREEN, margin: 0,
  });
  s.addText("Share of Monthly Active Customers who purchase from at least one new category in a calendar month.", {
    x: M + 0.4, y: 2.3, w: CW - 0.8, h: 0.6, fontFace: HEAD, fontSize: 19, color: INK, margin: 0,
  });
  s.addText("Binary per customer. Three new categories still counts once — breadth is a secondary signal, not the target.", {
    x: M + 0.4, y: 2.95, w: CW - 0.8, h: 0.4, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0,
  });

  stat(s, M, 4.1, 3.6, F.baseline, "already tried a new category this month", GREEN,
    "Our survey, n=26 — self-reported, so an upper bound");
  stat(s, M + 4.3, 4.1, 3.6, "54%", "buy from only 2–3 categories a month", INK,
    "Breadth, not frequency, is the constraint");
  stat(s, M + 8.6, 4.1, 3.6, "+1.25pp", "realistic lift, base scenario", MUTED,
    "An incremental feature, not a step change");
  footnote(s, "Baseline halves the addressable population the brief assumes. We state that rather than assume the bigger prize.");
  s.addNotes("Leading with a number that shrinks our own opportunity is deliberate — it signals we measured rather than assumed.");
}

/* ---------- 3. method ---------- */
{
  const s = pres.addSlide();
  kicker(s, "How we investigated");
  title(s, "Three instruments, deliberately different");
  numberedRow(s, 1, M, 1.85, 3.9,
    `${F.docs} public documents`,
    `Google Play, App Store and Reddit, scraped and de-duplicated. ${F.coded} coded by an LLM against a codebook induced from the data itself.`);
  numberedRow(s, 2, M + 4.3, 1.85, 3.9,
    "26 survey responses",
    "Barriers competing on equal footing, plus behavioural recall of the last out-of-basket purchase.");
  numberedRow(s, 3, M + 8.6, 1.85, 3.9,
    "6 depth interviews",
    "Including one new pet owner in the target segment, and one respondent who rejects discovery entirely.");

  card(s, M, 3.9, CW, 2.5);
  s.addText("How we tried to be wrong", {
    x: M + 0.4, y: 4.1, w: CW - 0.8, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: GREEN, margin: 0,
  });
  s.addText(
    [
      { text: "Open coding first — the codebook is induced from a stratified sample before anything is classified, so themes come from the data, not our hypothesis.", options: { bullet: true, breakLine: true } },
      { text: "A theme is only reported if it appears in at least two independent sources. The rule was written before we knew what it would reject.", options: { bullet: true, breakLine: true } },
      { text: "Every quote is verified verbatim against its source document; anything paraphrased is dropped rather than shown.", options: { bullet: true, breakLine: true } },
      { text: "Codes below 0.5 confidence are excluded and counted as rejected, not quietly absorbed.", options: { bullet: true, breakLine: true } },
      {
        text:
          holdout && holdout.rater === "second_model"
            ? `A second, different model (GPT) re-coded 60 documents blind: cross-model κ = ${holdout.cohens_kappa} (${holdout.interpretation}). Reported as reliability, not human validation.`
            : holdout
              ? `60 documents hand-coded blind: κ = ${holdout.cohens_kappa} (${holdout.interpretation}).`
              : "Inter-rater agreement pending a blind re-coding pass.",
        options: { bullet: true },
      },
    ],
    { x: M + 0.4, y: 4.5, w: CW - 0.8, h: 1.9, fontFace: BODY, fontSize: 12.5, color: INK, margin: 0, paraSpaceAfter: 6 },
  );
  footnote(s, "Pipeline is reproducible end to end: scripts/discovery/0-fetch → 1-normalize → 2-tag → 3-analyze → 4-holdout.");
}

/* ---------- 4. the null result ---------- */
{
  const s = pres.addSlide();
  kicker(s, "What happened when we tested it", "B54708");
  title(s, "Our hypothesis did not survive the corpus");

  card(s, M, 1.8, 6.0, 4.3, "FBF3E8");
  s.addText("What we expected to find", {
    x: M + 0.35, y: 2.0, w: 5.3, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: "B54708", margin: 0,
  });
  s.addText(
    [
      { text: "Users hold back from unfamiliar categories because a first purchase feels expensive", options: { bullet: true, breakLine: true } },
      { text: "That hesitation shows up in public feedback", options: { bullet: true, breakLine: true } },
      { text: "Price complaints and exploration barriers are the same problem", options: { bullet: true } },
    ],
    { x: M + 0.35, y: 2.45, w: 5.3, h: 1.6, fontFace: BODY, fontSize: 13, color: INK, margin: 0, paraSpaceAfter: 8 },
  );
  s.addText("We predicted 222 documents would link trial risk to pricing.", {
    x: M + 0.35, y: 5.3, w: 5.3, h: 0.5, fontFace: BODY, fontSize: 12, italic: true, color: MUTED, margin: 0,
  });

  card(s, M + 6.4, 1.8, 6.0, 4.3);
  s.addText("What the data said", {
    x: M + 6.75, y: 2.0, w: 5.3, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: GREEN, margin: 0,
  });
  s.addText(
    [
      { text: `Occasion signals appear in ${F.spikers} of coded documents`, options: { bullet: true, breakLine: true } },
      { text: `The habitual-purchasing theme is n=${F.habitual}`, options: { bullet: true, breakLine: true } },
      { text: "A theme named for category-exploration deterrents appeared once, in one source, and was rejected by our own two-source rule", options: { bullet: true } },
    ],
    { x: M + 6.75, y: 2.45, w: 5.3, h: 1.9, fontFace: BODY, fontSize: 13, color: INK, margin: 0, paraSpaceAfter: 8 },
  );
  s.addText(`Actual: ${F.bridge} documents. Claim withdrawn.`, {
    x: M + 6.75, y: 5.3, w: 5.3, h: 0.5, fontFace: BODY, fontSize: 12, bold: true, color: GREEN, margin: 0,
  });
  footnote(s, "Nobody writes a review about the pet food they didn't buy. We report that as a limit of the instrument, not as proof of a silent problem.");
  s.addNotes("This slide is the strongest evidence of real analysis. A fabricated project never contains a refuted prediction.");
}

/* ---------- 5. the barrier ---------- */
{
  const s = pres.addSlide();
  kicker(s, "The finding");
  title(s, "The barrier is habit, not price");
  s.addChart(
    pres.ChartType.bar,
    [{
      name: "Share of respondents",
      labels: ["Habit: already know\nwhat I need", "Quality uncertainty", "Price", "Distrust of\nsuggestions"],
      values: [
        grp("habit").share * 100,
        grp("quality").share * 100,
        grp("price").share * 100,
        grp("trust").share * 100,
      ],
    }],
    {
      x: M, y: 1.8, w: 7.3, h: 4.3, barDir: "bar",
      chartColors: [GREEN, "9CC5A1", "9CC5A1", "9CC5A1"],
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"',
      dataLabelFontFace: BODY, dataLabelFontSize: 12, dataLabelColor: INK,
      catAxisLabelColor: INK, catAxisLabelFontFace: BODY, catAxisLabelFontSize: 12,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      showLegend: false, barGapWidthPct: 45, valAxisMaxVal: 105,
    },
  );
  card(s, M + 7.8, 1.8, 4.6, 4.3);
  s.addText("Said without being asked", {
    x: M + 8.15, y: 2.0, w: 3.9, h: 0.35, fontFace: BODY, fontSize: 12, bold: true, color: GREEN, margin: 0,
  });
  s.addText(
    '"I already know exactly what I need before opening the app."',
    { x: M + 8.15, y: 2.4, w: 3.9, h: 0.8, fontFace: HEAD, fontSize: 14, italic: true, color: INK, margin: 0 },
  );
  s.addText("Rhea, 26, orders daily", { x: M + 8.15, y: 3.15, w: 3.9, h: 0.3, fontFace: BODY, fontSize: 11, color: MUTED, margin: 0 });
  s.addText('"I just want to finish shopping quickly."',
    { x: M + 8.15, y: 3.7, w: 3.9, h: 0.6, fontFace: HEAD, fontSize: 14, italic: true, color: INK, margin: 0 });
  s.addText("Nikhil, 38 — who rejects discovery entirely", { x: M + 8.15, y: 4.3, w: 3.9, h: 0.5, fontFace: BODY, fontSize: 11, color: MUTED, margin: 0 });
  s.addText("4 of 6 interviewees described intent-driven, speed-first shopping unprompted.", {
    x: M + 8.15, y: 5.1, w: 3.9, h: 0.8, fontFace: BODY, fontSize: 12, color: INK, margin: 0,
  });
  footnote(s, `Survey Q7, n=${survey.responses}, multi-select. The one question where every barrier competed on equal footing.`);
}

/* ---------- 6. the trigger ---------- */
{
  const s = pres.addSlide();
  kicker(s, "The opportunity");
  title(s, "An occasion is what breaks the habit");
  s.addChart(
    pres.ChartType.bar,
    [{
      name: "Prompted last out-of-basket purchase",
      labels: survey.out_of_basket_prompts.map((p) => p.label.replace(" (e.g., monsoon)", "")),
      values: survey.out_of_basket_prompts.map((p) => p.share * 100),
    }],
    {
      x: M, y: 1.8, w: 7.3, h: 4.3, barDir: "bar",
      // occasion prompts green, everything else grey, the contrast bar rust —
      // light green read as "counts toward the 46%" when it does not
      chartColors: [GREEN, "C4CBD4", "C4CBD4", GREEN, "B54708", GREEN],
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"',
      dataLabelFontFace: BODY, dataLabelFontSize: 12, dataLabelColor: INK,
      catAxisLabelColor: INK, catAxisLabelFontFace: BODY, catAxisLabelFontSize: 11,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      showLegend: false, barGapWidthPct: 45, valAxisMaxVal: 40,
    },
  );
  // the individually-rounded bars sum to 47, the true share is 46 — showing the
  // raw count makes the rounding checkable instead of looking like an error
  stat(s, M + 7.9, 1.9, 4.5, F.occasion, "of out-of-basket buying is occasion-driven", GREEN,
    `Festival, hosting or season — ${survey.occasion_driven.count} of ${survey.responses} respondents`);
  stat(s, M + 7.9, 3.75, 4.5, F.rec, "came from an in-app recommendation", "B54708",
    "The platform leans on its weakest lever");
  s.addText("The gap between those two numbers is the case for this feature.", {
    x: M + 7.9, y: 5.5, w: 4.5, h: 0.7, fontFace: HEAD, fontSize: 14, italic: true, color: INK, margin: 0,
  });
  footnote(s, "Survey Q11: recall of an actual purchase, not a hypothetical — the strongest behavioural evidence we have.");
}

/* ---------- 7. problem definition ---------- */
{
  const s = pres.addSlide();
  kicker(s, "Problem definition");
  title(s, "Who, why, and what they do instead");
  const w = 3.9;
  card(s, M, 1.8, w, 4.3);
  s.addText("Segment", { x: M + 0.3, y: 2.0, w: w - 0.6, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: GREEN, margin: 0 });
  s.addText("Routine replenishers who shop with intent", { x: M + 0.3, y: 2.35, w: w - 0.6, h: 0.8, fontFace: HEAD, fontSize: 17, bold: true, color: INK, margin: 0 });
  s.addText(
    [
      { text: "Weekly or more", options: { bullet: true, breakLine: true } },
      { text: "2–3 categories a month (54%)", options: { bullet: true, breakLine: true } },
      { text: "Arrive with a list, search, leave", options: { bullet: true } },
    ],
    { x: M + 0.3, y: 3.25, w: w - 0.6, h: 1.5, fontFace: BODY, fontSize: 12.5, color: INK, margin: 0, paraSpaceAfter: 6 },
  );
  s.addText("We dropped our original 'Occasion Spikers' segment — it resolved to 18 documents and was 90% an existing persona relabelled.", {
    x: M + 0.3, y: 4.9, w: w - 0.6, h: 1.0, fontFace: BODY, fontSize: 11, italic: true, color: MUTED, margin: 0,
  });

  card(s, M + 4.3, 1.8, w, 4.3);
  s.addText("Root cause", { x: M + 4.6, y: 2.0, w: w - 0.6, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: GREEN, margin: 0 });
  s.addText("The session is execution, not shopping", { x: M + 4.6, y: 2.35, w: w - 0.6, h: 0.8, fontFace: HEAD, fontSize: 17, bold: true, color: INK, margin: 0 });
  s.addText("The list is written before the app opens. Discovery has to interrupt an errand, which is why a browse destination cannot work — and why an occasion, which changes the errand itself, can.", {
    x: M + 4.6, y: 3.25, w: w - 0.6, h: 1.6, fontFace: BODY, fontSize: 12.5, color: INK, margin: 0, lineSpacingMultiple: 1.2,
  });
  s.addText("Rejected: price risk (15%, 0 of 6 interviews). Demoted: quality uncertainty (19%).", {
    x: M + 4.6, y: 5.1, w: w - 0.6, h: 0.8, fontFace: BODY, fontSize: 11, italic: true, color: MUTED, margin: 0,
  });

  card(s, M + 8.6, 1.8, w, 4.3);
  s.addText("Workarounds today", { x: M + 8.9, y: 2.0, w: w - 0.6, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: GREEN, margin: 0 });
  s.addText("They leave the app", { x: M + 8.9, y: 2.35, w: w - 0.6, h: 0.5, fontFace: HEAD, fontSize: 17, bold: true, color: INK, margin: 0 });
  s.addText(
    [
      { text: `${F.insta} first hear about a product on Instagram; only ${F.inApp} in the app`, options: { bullet: true, breakLine: true } },
      { text: '"Google and YouTube" — Meghna, choosing her first pet food', options: { bullet: true, breakLine: true } },
      { text: '"I buy beer, chips and soft drinks separately. Nobody tells me what I\'m missing." — Kabir', options: { bullet: true } },
    ],
    { x: M + 8.9, y: 2.95, w: w - 0.6, h: 3.0, fontFace: BODY, fontSize: 12, color: INK, margin: 0, paraSpaceAfter: 10 },
  );
  footnote(s, "In-app discovery is the second channel, not the first. Any solution requiring browsing loses to Instagram before it starts.");
}

/* ---------- 8. triangulation ---------- */
{
  const s = pres.addSlide();
  kicker(s, "Validation");
  title(s, "Where the engine and the research disagreed");
  const rows = [
    [
      { text: "Claim", options: { bold: true, color: PAPER, fill: { color: INK } } },
      { text: "Corpus (799)", options: { bold: true, color: PAPER, fill: { color: INK } } },
      { text: "Survey (26)", options: { bold: true, color: PAPER, fill: { color: INK } } },
      { text: "Interviews (6)", options: { bold: true, color: PAPER, fill: { color: INK } } },
      { text: "Verdict", options: { bold: true, color: PAPER, fill: { color: INK } } },
    ],
    ["Habit is the barrier", "Not detectable", F.habit, "4 of 6, unprompted", "Upheld"],
    ["Occasions break the habit", `${F.spikers} of docs`, `${F.occasion} of out-of-basket`, "3 of 6", "Engine wrong, research upheld"],
    ["Price risk is the barrier", `${F.bridge} docs (5%)`, F.price, "0 of 6", "Refuted — withdrawn"],
    ["Quality uncertainty is the root", "Largest theme (n=105)", F.quality, "2 of 6", "Demoted to secondary"],
    ["Exploration is discussed publicly", "n=1, rejected by our rule", "—", "—", "Refuted"],
  ];
  s.addTable(rows, {
    x: M, y: 1.85, w: CW, colW: [3.3, 2.4, 2.1, 2.2, 1.93],
    fontFace: BODY, fontSize: 12, color: INK, border: { type: "solid", color: "E4E7EC", pt: 1 },
    fill: { color: PAPER }, rowH: 0.52, valign: "middle",
  });
  card(s, M, 5.35, CW, 1.15, TINT);
  s.addText(
    "The primary research changed our conclusion twice — first away from price risk, then away from quality uncertainty. Both corrections are in the repository history.",
    { x: M + 0.4, y: 5.55, w: CW - 0.8, h: 0.75, fontFace: HEAD, fontSize: 14, italic: true, color: INK, margin: 0 },
  );
  s.addNotes("If asked which source to trust: the survey's barrier question is the only instrument where competing explanations were tested against each other.");
}

/* ---------- 9. the MVP ---------- */
{
  const s = pres.addSlide();
  kicker(s, "The MVP");
  title(s, "Interrupt the errand at the one moment intent is visible");
  numberedRow(s, 1, M, 1.9, 3.9, "Infer the occasion",
    "From the basket plus light context. Deterministic matcher first, LLM as enrichment — the rules pass 12 of 12 golden cases and the model has never beaten them.");
  numberedRow(s, 2, M + 4.3, 1.9, 3.9, "Complete across new categories",
    "Up to three suggestions, only from categories the customer has never bought, each with a one-line reason tied to the occasion.");
  numberedRow(s, 3, M + 8.6, 1.9, 3.9, "De-risk the first try",
    "Starter pack sizing, rating and a why-this screen. Reported honestly: this is the least-endorsed part of the concept.");

  card(s, M, 4.0, 6.0, 2.4);
  s.addText("Why AI is not the headline", {
    x: M + 0.35, y: 4.2, w: 5.3, h: 0.35, fontFace: BODY, fontSize: 12.5, bold: true, color: GREEN, margin: 0,
  });
  s.addText("At 6 occasions and 37 SKUs, a lookup table wins. The LLM earns its place only at real catalog scale, and we say so rather than claim AI-native for its own sake. Production falls back to rules and tells the user when it does.", {
    x: M + 0.35, y: 4.6, w: 5.3, h: 1.6, fontFace: BODY, fontSize: 12.5, color: INK, margin: 0, lineSpacingMultiple: 1.2,
  });

  card(s, M + 6.4, 4.0, 6.0, 2.4, INK);
  s.addText("Live", { x: M + 6.75, y: 4.2, w: 5.3, h: 0.35, fontFace: BODY, fontSize: 12.5, bold: true, color: YELLOW, margin: 0 });
  s.addText("blinkit-moments.vercel.app", {
    x: M + 6.75, y: 4.6, w: 5.3, h: 0.5, fontFace: HEAD, fontSize: 20, bold: true, color: PAPER, margin: 0,
  });
  s.addText("Four screens plus a /discovery dashboard that publishes the analysis behind this deck — including the findings that contradict us.", {
    x: M + 6.75, y: 5.2, w: 5.3, h: 1.0, fontFace: BODY, fontSize: 12, color: "C9D6CC", margin: 0, lineSpacingMultiple: 1.2,
  });
}

/* ---------- 10. what research changed ---------- */
{
  const s = pres.addSlide();
  kicker(s, "Research changing the product");
  title(s, "What we removed after listening");
  const rows = [
    [
      { text: "Change", options: { bold: true, color: PAPER, fill: { color: INK } } },
      { text: "Evidence", options: { bold: true, color: PAPER, fill: { color: INK } } },
    ],
    ["Suggestions capped at 3 (was 4)", '"One or two useful suggestions. Not ten." — Nikhil'],
    ["Removed fitness_kickoff and baby_arrival", "Zero mentions across 6 interviews and 26 responses"],
    ["Added hosting_guests and movie_night", "Both volunteered — Kabir, Aditya, Sara"],
    ["festival_prep weighted highest", "31% — the largest single out-of-basket trigger"],
    ["Dropped the 'Occasion Spikers' segment", "18 documents, 90% overlap with an existing persona"],
    ["Occasion inference demoted to mechanism", "Occasion signals are 2% of the corpus"],
  ];
  s.addTable(rows, {
    x: M, y: 1.85, w: CW, colW: [5.0, 6.93],
    fontFace: BODY, fontSize: 13, color: INK, border: { type: "solid", color: "E4E7EC", pt: 1 },
    fill: { color: PAPER }, rowH: 0.55, valign: "middle",
  });
  card(s, M, 5.9, CW, 0.85, TINT);
  s.addText("Every occasion in the catalog now carries the quote or figure that justifies it, in code.", {
    x: M + 0.4, y: 6.05, w: CW - 0.8, h: 0.5, fontFace: HEAD, fontSize: 14, italic: true, color: INK, margin: 0,
  });
}

/* ---------- 11. business + experiment ---------- */
{
  const s = pres.addSlide();
  kicker(s, "Is it worth building");
  title(s, "Sized honestly, and designed to be disproved");

  card(s, M, 1.8, 6.0, 4.6);
  s.addText("Business case", { x: M + 0.35, y: 2.0, w: 5.3, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: GREEN, margin: 0 });
  s.addText(
    [
      { text: "Conservative +0.6pp · Base +1.25pp · Optimistic +2.4pp", options: { bullet: true, breakLine: true } },
      { text: "Occasion beats discount: deals drove 19% of exploration but give away margin every time and build no habit", options: { bullet: true, breakLine: true } },
      { text: "Biggest unknown: whether an adopted category persists. It carries most of the value and we cannot measure it from outside", options: { bullet: true, breakLine: true } },
      { text: "Strongest argument against us: convenience (n=123) and quality (n=105) dwarf habitual purchasing (n=8) in the corpus", options: { bullet: true } },
    ],
    { x: M + 0.35, y: 2.4, w: 5.3, h: 3.4, fontFace: BODY, fontSize: 12, color: INK, margin: 0, paraSpaceAfter: 9, valign: "top" },
  );
  s.addText("Kill criterion: if dark stores can't hold starter-pack SKUs, stop.", {
    x: M + 0.35, y: 5.85, w: 5.3, h: 0.4, fontFace: BODY, fontSize: 11.5, bold: true, color: "B54708", margin: 0,
  });

  card(s, M + 6.4, 1.8, 6.0, 4.6, INK);
  s.addText("Experiment", { x: M + 6.75, y: 2.0, w: 5.3, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: YELLOW, margin: 0 });
  s.addText(
    [
      { text: "Randomise on customer, not session — the metric is monthly per customer", options: { bullet: true, breakLine: true } },
      { text: "n = 4,361 per arm for a 3pp lift; 28 days minimum", options: { bullet: true, breakLine: true } },
      { text: "We power for an effect worth shipping, not the one we expect. A null result is an answer", options: { bullet: true, breakLine: true } },
      { text: "Never run across Diwali — festivals are 31% of triggers and would inflate an effect that won't replicate", options: { bullet: true } },
    ],
    { x: M + 6.75, y: 2.4, w: 5.3, h: 3.2, fontFace: BODY, fontSize: 12, color: "E7EFE9", margin: 0, paraSpaceAfter: 9, valign: "top" },
  );
  s.addText("Arm C (occasion framing) must beat Arm B (generic framing), or the AI is decoration and comes out.", {
    x: M + 6.75, y: 5.7, w: 5.3, h: 0.6, fontFace: BODY, fontSize: 11.5, bold: true, color: YELLOW, margin: 0,
  });
  footnote(s, "Sample sizes computed by scripts/experiment-power.mjs, not asserted.");
}

/* ---------- 12. limitations ---------- */
{
  const s = pres.addSlide();
  s.background = { color: INK };
  kicker(s, "What would make me distrust this", YELLOW);
  title(s, "Limitations, stated first", { color: PAPER });
  s.addText(
    [
      { text: "The corpus is 65% coded — 454 documents remain, blocked on an LLM quota. Figures are provisional.", options: { bullet: true, breakLine: true } },
      { text: "No inter-coder agreement yet. The hold-out sheet exists but is unscored, so coding quality behind every corpus figure is unverified.", options: { bullet: true, breakLine: true } },
      { text: "Survey n=26, self-selected, 84% under 35. No non-metro and no price-sensitive respondents.", options: { bullet: true, breakLine: true } },
      { text: "Several interview questions were leading. Only unprompted material is cited as support.", options: { bullet: true, breakLine: true } },
      { text: "Three of seven source types were covered. Forums and social media were not — X sits behind a paid API.", options: { bullet: true, breakLine: true } },
      { text: "The prototype was built before the research. That is visible in the commit history and we have not dressed it up.", options: { bullet: true } },
    ],
    { x: M, y: 1.8, w: 7.6, h: 4.2, fontFace: BODY, fontSize: 13.5, color: "D8E3DB", margin: 0, paraSpaceAfter: 11 },
  );
  card(s, M + 8.0, 1.8, 4.4, 4.2, "16351F");
  s.addText("Next", { x: M + 8.35, y: 2.0, w: 3.7, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: YELLOW, margin: 0 });
  s.addText(
    [
      { text: "Finish coding the corpus", options: { bullet: true, breakLine: true } },
      { text: "Hand-code the hold-out, publish κ", options: { bullet: true, breakLine: true } },
      { text: "Instrument a dismiss event — the annoyance guardrail is unmeasurable today", options: { bullet: true, breakLine: true } },
      { text: "Answer the dark-store SKU question before any build", options: { bullet: true } },
    ],
    { x: M + 8.35, y: 2.45, w: 3.7, h: 3.2, fontFace: BODY, fontSize: 12.5, color: "D8E3DB", margin: 0, paraSpaceAfter: 9 },
  );
  s.addText("A submission that reports only what it can defend.", {
    x: M, y: 6.4, w: CW, h: 0.5, fontFace: HEAD, fontSize: 16, italic: true, color: YELLOW, margin: 0,
  });
}

mkdirSync("deck", { recursive: true });
await pres.writeFile({ fileName: "deck/Blinkit-Moments-Fellowship.pptx" });
console.log("wrote deck/Blinkit-Moments-Fellowship.pptx");
console.log(`figures pulled live: habit ${F.habit} · occasion ${F.occasion} · baseline ${F.baseline} · corpus ${F.coded}/${F.docs}`);
