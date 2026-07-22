// ponytail: per-instance in-memory limiter — resets on cold start. Move to
// Upstash/Redis if this ever sees real traffic.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function clientKey(headers: Headers, scope: string): string {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${scope}:${ip}`;
}

export const tooMany = () =>
  Response.json({ error: "rate limited" }, { status: 429 });
