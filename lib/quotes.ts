/**
 * Display-layer filter for verbatim evidence.
 *
 * Nothing here mutates or deletes stored data — data/tagged.json and
 * data/insights.json keep every quote the coder produced. This decides only
 * what is worth putting in front of a reader: a quote that is off-theme,
 * low-confidence, truncated mid-sentence, or full of Reddit furniture damages
 * the credibility of the theme it is meant to support.
 */

export type DisplayQuote = {
  quote: string;
  source: string;
  url: string | null;
  rating: number | null;
  segment: string;
  confidence: number;
  theme: string;
};

/** Below this the coder was guessing; a guessed quote is not evidence. */
export const MIN_CONFIDENCE = 0.7;
export const MIN_WORDS = 6;
export const MAX_SHOWN = 3;

const URL_OR_IMAGE = /(https?:\/\/|www\.|!\[[^\]]*\]\(|\]\(\s*http)/i;
/** Reddit furniture: superscript markers, karma talk, bot signatures. */
const BOT_NOISE = /(\^\^|\bkarma\b|\bu\/[A-Za-z0-9_-]+|\br\/[A-Za-z0-9_]+\s*$|i am a bot|^edit:)/i;
/** A complete thought ends in terminal punctuation (a closing quote may follow). */
const ENDS_CLEANLY = /[.!?][")\]]?\s*$/;
/** Ellipsis or a dangling connective means the text was cut off. */
const TRUNCATED = /(\.\.\.|…|\b(and|but|or|the|a|to|of|for|with|it|is|was|in|on)\s*$)/i;
/**
 * A quote lifted from the middle of a sentence starts lowercase or on a stray
 * apostrophe — "'t find location", "urnout this early". Real evidence starts
 * with a capital, a digit, or an opening quotation mark.
 */
const STARTS_MID_SENTENCE = /^[^A-Z0-9"“(]/;
/** Markdown emphasis, headings, blockquotes, HTML entities — forum markup. */
const MARKUP = /(\*\*|__|^>|^#{1,6}\s|&amp;|&#x|&quot;)/;
/**
 * Romanised Hindi passes a Latin-script check but is unreadable as English
 * evidence. Two or more markers to reject, so an English sentence containing
 * one stray token is not thrown away.
 */
const HINGLISH =
  /\b(nhi|nahi|kiya|karta|karte|tha|thi|hai|hain|kya|mein|aur|bhi|bhai|yaar|bohot|bahut|acha|accha|thoda|abhi|kitna|jaldi|paisa|chahiye)\b/gi;

/** Mostly-Latin, matching the corpus language filter. */
function isEnglish(text: string): boolean {
  const letters = text.replace(/[^\p{L}]/gu, "");
  if (!letters) return false;
  const latin = (text.match(/[a-zA-Z]/g) ?? []).length;
  return latin / letters.length > 0.85;
}

/** Why a quote was withheld, or null if it is displayable. */
export function rejectReason(q: DisplayQuote, themeId: string): string | null {
  const text = (q.quote ?? "").trim();
  if (!text) return "empty";
  if (q.theme !== themeId) return "off-theme";
  if ((q.confidence ?? 0) < MIN_CONFIDENCE) return "low-confidence";
  if (URL_OR_IMAGE.test(text)) return "contains a link or image";
  if (BOT_NOISE.test(text) || MARKUP.test(text)) return "bot or forum furniture";
  // Language before shape. Other scripts have no capitals to open with and end
  // sentences with their own punctuation (a Devanagari danda, say), so checking
  // shape first would report them as malformed English rather than as another
  // language.
  if (!isEnglish(text) || (text.match(HINGLISH) ?? []).length >= 2) return "not English";
  if (STARTS_MID_SENTENCE.test(text)) return "starts mid-sentence";
  if (text.trim().split(/\s+/).length < MIN_WORDS) return "too short";
  if (TRUNCATED.test(text)) return "truncated";
  if (!ENDS_CLEANLY.test(text)) return "no sentence ending";
  return null;
}

export const isDisplayable = (q: DisplayQuote, themeId: string) => rejectReason(q, themeId) === null;

/**
 * The cleanest on-theme quotes, highest confidence first, de-duplicated.
 * Returns the survivors plus how many were withheld, so the UI can say so
 * rather than silently showing fewer.
 */
export function pickQuotes(
  quotes: DisplayQuote[] | undefined,
  themeId: string,
  limit = MAX_SHOWN,
): { shown: DisplayQuote[]; withheld: number } {
  const all = quotes ?? [];
  const seen = new Set<string>();
  const clean = all
    .filter((q) => isDisplayable(q, themeId))
    .sort((a, b) => b.confidence - a.confidence || b.quote.length - a.quote.length)
    .filter((q) => {
      const key = q.quote.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return { shown: clean.slice(0, limit), withheld: all.length - clean.length };
}
