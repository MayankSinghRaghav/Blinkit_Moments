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

export type OccasionSpikers = {
  label: string;
  definition: string;
  derivation: string;
  size: number;
  share_of_coded: number;
  criteria: { life_stage_only: number; occasion_keyword_only: number; both: number };
  keyword_source: string;
  keywords_used: number;
  keywords_excluded: string[];
  top_keywords: [string, number][];
  by_source: Record<string, number>;
  top_themes: { id: string; label: string; n: number }[];
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
    returned_by_coder: number;
    with_theme: number;
    no_theme: number;
    low_confidence: number;
    min_code_confidence: number;
    uncoded: number;
    by_source: Record<string, number>;
    sources: string[];
  };
  validity: {
    rule: string;
    code_rule: string;
    valid_themes: number;
    rejected_themes: { id: string; label: string; sources: string[]; count: number }[];
  };
  scoring: Scoring;
  bridge: Bridge;
  themes: Theme[];
  occasion_spikers: OccasionSpikers;
  segments: { id: string; count: number; top_themes: { id: string; label: string; n: number }[] }[];
};

export type Survey = {
  responses: number;
  caveats: string[];
  barrier_groups: { group: string; count: number; share: number }[];
  out_of_basket_prompts: { label: string; count: number; share: number }[];
  occasion_driven: { count: number; share: number };
  north_star_baseline: { tried_new_category_within_a_month: number; share: number };
  first_hear_about_product: { label: string; count: number; share: number }[];
  stated_preference: Record<string, { n: number; mean: number; top2_box: number; neutral: number }>;
};

export type Sensitivity = {
  opportunity: {
    weightings_tested: number;
    top1_stable: number;
    topN_set_stable: number;
    mean_spearman: number;
    min_spearman: number;
    most_volatile: { id: string; label: string; best: number; worst: number; swing: number }[];
  };
  strategic_fit: {
    top1_stable: number;
    mean_spearman: number;
    min_spearman: number;
  };
  conclusions: {
    core_theme_leads_strategic_priority: number;
    context_theme_leads_raw_opportunity: number;
  };
  confidence_floor_sweep: {
    floor: number;
    accepted: number;
    rejected_low_confidence: number;
  }[];
};

export type Holdout = {
  model_codes?: string;
  second_codes?: string;
  rater?: "human" | "second_model";
  fixture_derived?: boolean;
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
export const loadSurvey = () => read<Survey>("survey.json");
export const loadSensitivity = () => read<Sensitivity>("sensitivity.json");
