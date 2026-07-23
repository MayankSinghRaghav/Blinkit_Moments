import { existsSync } from "node:fs";
import { join } from "node:path";
import { llmConfigured } from "@/lib/llm";
import { supabaseConfigured, supabaseDiagnostics } from "@/lib/supabase/admin";
import { PRODUCTS } from "@/lib/data/catalog";
import { OCCASIONS } from "@/lib/occasions";

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
    llm: llmConfigured() ? "gemini-2.5-flash" : "degraded (deterministic matcher)",
    store: supabaseConfigured() ? "supabase" : "in-memory",
    // presence flags only, never values — so a broken deployment can be
    // diagnosed without anyone opening the dashboard
    config: supabaseDiagnostics(),
  });
}
