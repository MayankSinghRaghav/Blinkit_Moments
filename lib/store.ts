import "server-only";
import { admin } from "@/lib/supabase/admin";
import type { AdoptionEvent } from "@/lib/scoring";

export type SessionState = { baseline: string[]; comfort: number; events: AdoptionEvent[] };

// ponytail: per-instance map — fine for a single-session demo, resets on cold
// start. Set SUPABASE_* env vars and it persists in Postgres instead.
// Pinned to globalThis so dev HMR / route recompiles don't wipe the session.
const g = globalThis as typeof globalThis & { __moments?: Map<string, SessionState> };
const mem = (g.__moments ??= new Map<string, SessionState>());

const blank = (): SessionState => ({ baseline: [], comfort: 50, events: [] });

export async function getSession(id: string): Promise<SessionState> {
  const db = admin();
  if (!db) return mem.get(id) ?? blank();

  const [{ data: session }, { data: events }] = await Promise.all([
    db.from("sessions").select("comfort, baseline").eq("id", id).maybeSingle(),
    db.from("adoption_events").select("product_id, category, event, occasion_id").eq("session_id", id),
  ]);
  return {
    baseline: session?.baseline ?? [],
    comfort: session?.comfort ?? 50,
    events: (events ?? []) as AdoptionEvent[],
  };
}

export async function upsertSession(
  id: string,
  patch: Partial<Pick<SessionState, "baseline" | "comfort">>,
): Promise<void> {
  const db = admin();
  if (!db) {
    mem.set(id, { ...(mem.get(id) ?? blank()), ...patch });
    return;
  }
  await db.from("sessions").upsert({ id, ...patch });
}

export async function addEvents(id: string, events: AdoptionEvent[]): Promise<void> {
  if (!events.length) return;
  const db = admin();
  if (!db) {
    const s = mem.get(id) ?? blank();
    mem.set(id, { ...s, events: [...s.events, ...events] });
    return;
  }
  await db.from("adoption_events").insert(events.map((e) => ({ ...e, session_id: id })));
}
