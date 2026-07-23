import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;
let failure: string | null = null;

/**
 * Resolve the project URL, preferring the server-only name.
 *
 * `NEXT_PUBLIC_*` variables are **inlined by Next.js at build time** — the
 * compiler substitutes a literal. If the variable is absent when the build
 * runs, the bundle contains `undefined` and no amount of runtime configuration
 * will fix it; the deployment has to be rebuilt. The service-role key, having
 * no prefix, is read at runtime, so the two behave differently and a
 * half-configured project fails in a way that looks like nothing happened.
 *
 * This URL is only ever used server-side, so it should never have carried the
 * public prefix. `SUPABASE_URL` is preferred; the prefixed name is still
 * accepted so existing deployments keep working.
 *
 * Values are trimmed and unquoted: pasting into a dashboard field very often
 * carries surrounding quotes or whitespace, and `createClient` throws on those
 * rather than ignoring them.
 */
function projectUrl(): string | undefined {
  const raw = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  return raw?.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "") || undefined;
}

const serviceKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^["']|["']$/g, "") || undefined;

/**
 * Service-role client, or null when Supabase is not usable.
 *
 * Never throws. A malformed URL used to take down every route that touched the
 * store — including /api/health, which is the one endpoint that has to keep
 * answering when the configuration is wrong. The failure is recorded and
 * reported instead.
 */
export function admin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = projectUrl();
  const key = serviceKey();
  if (!url || !key) {
    failure = !url && !key ? "url and key missing" : !url ? "url missing" : "key missing";
    client = null;
    return client;
  }
  try {
    client = createClient(url, key, { auth: { persistSession: false } });
    failure = null;
  } catch (e) {
    failure = (e as Error).message;
    client = null;
  }
  return client;
}

export const supabaseConfigured = () => admin() !== null;

/**
 * Which pieces of configuration are present, and why the client failed if it
 * did — booleans and an error string only, never values. Exists so a
 * misconfigured deployment can be diagnosed from outside.
 */
export function supabaseDiagnostics() {
  const resolved = supabaseConfigured();
  const url = projectUrl();
  return {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    // shape only — enough to spot a paste error without exposing the project
    url_looks_valid: url ? /^https:\/\/[^\s/]+\.supabase\.(co|in)$/.test(url) : false,
    url_length: url?.length ?? 0,
    resolved,
    error: resolved ? null : failure,
  };
}
