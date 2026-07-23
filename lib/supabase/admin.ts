import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Resolve the project URL, preferring the server-only name.
 *
 * `NEXT_PUBLIC_*` variables are **inlined by Next.js at build time** — the
 * compiler substitutes a literal string. If the variable is absent when the
 * build runs, the bundle contains `undefined` and no amount of runtime
 * configuration will fix it; the deployment has to be rebuilt. The service-role
 * key, having no prefix, is read at runtime, so the two behave differently and
 * a half-configured project fails in a way that looks like nothing happened.
 *
 * This URL is only ever used server-side, so it should never have carried the
 * public prefix. `SUPABASE_URL` is now preferred; the prefixed name is still
 * accepted so existing deployments keep working.
 */
function projectUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/** Service-role client, or null when the demo runs without Supabase configured. */
export function admin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = projectUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export const supabaseConfigured = () => admin() !== null;

/**
 * Which pieces of configuration are present — booleans only, never values.
 * Exists so a misconfigured deployment can be diagnosed from outside without
 * anyone reading secrets out of a dashboard.
 */
export function supabaseDiagnostics() {
  return {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    resolved: supabaseConfigured(),
  };
}
