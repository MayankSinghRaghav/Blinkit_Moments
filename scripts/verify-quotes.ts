/**
 * Checks the verbatim-evidence display filter.
 *   npm run verify:quotes
 * Each rejection rule gets a case that must fail and the clean control must
 * pass, so a loosened regex shows up here rather than on the page.
 */
import { MAX_SHOWN, pickQuotes, rejectReason, type DisplayQuote } from "@/lib/quotes";

const base: DisplayQuote = {
  quote: "I never buy pet food here because I cannot tell if the quality is any good.",
  source: "reddit",
  url: null,
  rating: null,
  segment: "routine_replenisher",
  confidence: 0.9,
  theme: "trust_gap",
};
const q = (over: Partial<DisplayQuote>): DisplayQuote => ({ ...base, ...over });

const checks: [string, boolean][] = [];
const check = (name: string, ok: boolean) => checks.push([name, ok]);
const rejects = (over: Partial<DisplayQuote>, expected: string) =>
  rejectReason(q(over), "trust_gap") === expected;

check("clean on-theme quote passes", rejectReason(base, "trust_gap") === null);

check("off-theme rejected", rejects({ theme: "pricing" }, "off-theme"));
check("confidence 0.69 rejected", rejects({ confidence: 0.69 }, "low-confidence"));
check("confidence 0.70 accepted", rejectReason(q({ confidence: 0.7 }), "trust_gap") === null);

check(
  "http link rejected",
  rejects({ quote: "Look at this deal https://blinkit.com/offer it is great." }, "contains a link or image"),
);
check(
  "www link rejected",
  rejects({ quote: "I compared prices on www.zepto.com before ordering here." }, "contains a link or image"),
);
check(
  "markdown image rejected",
  rejects({ quote: "Here is my receipt ![screenshot](img.png) from the order." }, "contains a link or image"),
);

check(
  "superscript marker rejected",
  rejects({ quote: "^^I ^^never ^^buy ^^pet ^^food ^^here ^^at ^^all." }, "bot or forum furniture"),
);
check(
  "karma talk rejected",
  rejects({ quote: "This post is just farming karma from the usual crowd." }, "bot or forum furniture"),
);
check(
  "bot signature rejected",
  rejects({ quote: "I am a bot and this action was performed automatically." }, "bot or forum furniture"),
);
check(
  "username mention rejected",
  rejects({ quote: "As u/someuser said above, the packs are far too large." }, "bot or forum furniture"),
);

check("five words rejected", rejects({ quote: "Too big a pack size." }, "too short"));
check(
  "six words accepted",
  rejectReason(q({ quote: "The pack size is far too large." }), "trust_gap") === null,
);

check(
  "ellipsis truncation rejected",
  rejects({ quote: "I wanted to try the dog treats but the pack was..." }, "truncated"),
);
check(
  "dangling connective rejected",
  rejects({ quote: "I would try a new category if the price was lower and" }, "truncated"),
);
check(
  "mid-word cut rejected",
  rejects({ quote: "I never buy pet food here because I cannot tell the qual" }, "no sentence ending"),
);
check(
  "question mark accepted",
  rejectReason(q({ quote: "Why is the smallest pack still six hundred rupees?" }), "trust_gap") === null,
);
check(
  "closing quote after period accepted",
  rejectReason(q({ quote: 'The app said "we deliver everything you need."' }), "trust_gap") === null,
);

check(
  "starts mid-word rejected",
  rejects({ quote: "'t find the location even after giving the full address every time." }, "starts mid-sentence"),
);
check(
  "starts mid-word without apostrophe rejected",
  rejects({ quote: "urnout this early, channel your thoughts and see what works." }, "starts mid-sentence"),
);
check(
  "starts with a digit accepted",
  rejectReason(q({ quote: "300 rupees for a trial size is far too much to gamble." }), "trust_gap") === null,
);
check(
  "markdown bold rejected",
  rejects({ quote: "**PSA FOR ALL USERS** do not reply to direct messages here." }, "bot or forum furniture"),
);
check(
  "blockquote marker rejected",
  rejects({ quote: "> quoting the parent comment about pack sizes being large." }, "bot or forum furniture"),
);
check(
  "hinglish rejected on two markers",
  rejects({ quote: "Prices same product ki compare nhi kiya tha before ordering." }, "not English"),
);
check(
  "single stray token kept",
  rejectReason(q({ quote: "My bhai recommended the smaller pack for a first try." }), "trust_gap") === null,
);

check(
  "non-English rejected",
  rejects({ quote: "मुझे यह ऐप बहुत पसंद है और मैं इसे रोज़ इस्तेमाल करता हूँ।" }, "not English"),
);

// selection behaviour
const pool: DisplayQuote[] = [
  q({ quote: "The starter pack is the only reason I tried this category at all.", confidence: 0.95 }),
  q({ quote: "I cannot judge the quality of anything I have not bought before.", confidence: 0.88 }),
  q({ quote: "Buying a large pack of something unfamiliar feels like a gamble.", confidence: 0.82 }),
  q({ quote: "A smaller size would let me test it without the risk involved.", confidence: 0.75 }),
  q({ quote: "junk https://x.com link", confidence: 0.99 }),
  q({ quote: "off theme entirely here now", theme: "pricing", confidence: 0.99 }),
];
const picked = pickQuotes(pool, "trust_gap");
check("caps at 3 shown", picked.shown.length === MAX_SHOWN);
check("sorted by confidence", picked.shown[0].confidence === 0.95);
check("junk and off-theme excluded", picked.shown.every((x) => !x.quote.includes("http") && x.theme === "trust_gap"));
check("withheld counted", picked.withheld === 2);

const dupes = [q({ quote: "The pack size is far too large for a first try." }), q({ quote: "The pack size is far too large for a first try." })];
check("duplicates collapsed", pickQuotes(dupes, "trust_gap").shown.length === 1);

check("empty pool is safe", pickQuotes(undefined, "trust_gap").shown.length === 0);

for (const [name, ok] of checks) console.log(`  ${ok ? "pass" : "FAIL"}  ${name}`);
const failed = checks.filter(([, ok]) => !ok).length;
console.log(failed ? `\n${failed} check(s) failed` : `\nall ${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
