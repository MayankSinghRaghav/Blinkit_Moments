import { existsSync } from "node:fs";
import { join } from "node:path";
import { llmConfigured, llmModel } from "@/lib/llm";
import { supabaseConfigured, supabaseDiagnostics } from "@/lib/supabase/admin";
import { PRODUCTS } from "@/lib/data/catalog";
import { OCCASIONS } from "@/lib/occasions";
import { inferenceStats } from "@/lib/telemetry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const prompts = ["occasion_inference", "explain_suggestion"].every((n) =>
    existsSync(join(process.cwd(), "prompts", `${n}.txt`)),
  );
  return Response.json({
    ok: prompts && PRODUCTS.length > 0 && OCCASIONS.length > 0,
    prompts,
    products: PRODUCTS.length,
    occasions: OCCASIONS.length,
    llm: llmConfigured() ? llmModel() : "degraded (deterministic matcher)",
    store: supabaseConfigured() ? "supabase" : "in-memory",
    // presence flags only, never values — so a broken deployment can be
    // diagnosed without anyone opening the dashboard
    config: supabaseDiagnostics(),
    // per-instance since last cold start: how many inferences hit the model vs
    // the cache vs the deterministic fallback, and how fast
    inference: inferenceStats(),
  });
}
