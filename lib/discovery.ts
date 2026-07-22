import "server-only";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type Quote = {
  quote: string;
  source: string;
  url: string | null;
  rating: number | null;
  segment: string;
  /** carried so the display filter can drop low-confidence evidence */
  confidence: number;
  /** carried so the display filter can prove a quote belongs to its theme */
  theme: string;
};

export type Theme = {
  id: string;
  label: string;
  definition: string | null;
  relevance: "core" | "context";
  count: number;
  frequency: number;
  severity: number;
  confidence: number;
  sources: string[];
  per_source: Record<string, number>;
  segments: Record<string, number>;
  top_needs: [string, number][];
  categories: [string, number][];
  quotes: Quote[];
  /** share of voice: frequency + severity + segment spread */
  opportunity: number;
  /** fit with the new-category-adoption goal, 0-1, computed in 3-analyze.mjs */
  strategic_fit: number;
  /** opportunity x strategic_fit */
  strategic_priority: number;
  strategic_components: {
    core_relevance: number;
    trial_need: number;
    new_category: number;
  };
};

export type Bridge = {
  lexicon: string;
  trial_need_docs: number;
  share_of_coded: number;
  in_core_themes: number;
  in_context_themes: number;
  top_shared_needs: [string, number][];
  quotes: Quote[];
};

export type Scoring = {
  opportunity: string;
  strategic_fit: string;
  strategic_priority: string;
  weights: Record<string, number>;
  note: string;
};

export type Insights = {
  generated_from: string;
  corpus: {
    documents: number;
    coded: number;
    with_theme: number;
    unclassified: number;
    by_source: Record<string, number>;
    sources: string[];
  };
  validity: {
    rule: string;
    valid_themes: number;
    rejected_themes: { id: string; label: string; sources: string[]; count: number }[];
  };
  scoring: Scoring;
  bridge: Bridge;
  themes: Theme[];
  segments: { id: string; count: number; top_themes: { id: string; label: string; n: number }[] }[];
};

export type Holdout = {
  coded_pairs: number;
  raw_agreement: number;
  expected_by_chance: number;
  cohens_kappa: number;
  interpretation: string;
  top_confusions: [string, number][];
};

const read = <T,>(name: string): T | null => {
  const p = join(process.cwd(), "data", name);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : null;
};

/**
 * Real output when the tagger has run, otherwise the fixture — which is labelled
 * as such in the UI so a placeholder can never be mistaken for findings.
 */
export function loadInsights(): { data: Insights | null; fixture: boolean } {
  const real = read<Insights>("insights.json");
  if (real) return { data: real, fixture: false };
  return { data: read<Insights>("insights.sample.json"), fixture: true };
}

export const loadHoldout = () => read<Holdout>("holdout-report.json");
