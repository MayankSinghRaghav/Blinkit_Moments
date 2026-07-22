import "server-only";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type Quote = {
  quote: string;
  source: string;
  url: string | null;
  rating: number | null;
  segment: string;
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
  opportunity: number;
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
