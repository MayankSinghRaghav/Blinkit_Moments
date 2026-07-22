import { z } from "zod";
import { inferOccasion } from "@/lib/llm";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";
import { addEvents, getSession, upsertSession } from "@/lib/store";

export const runtime = "nodejs";

const Body = z.object({
  session_id: z.uuid(),
  basket: z
    .array(z.object({ product_id: z.string().optional(), name: z.string(), category: z.string() }))
    .max(50),
  context: z.string().max(200).default(""),
  comfort: z.number().int().min(0).max(100).default(50),
});

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req.headers, "infer"))) return tooMany();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });
  const { session_id, basket, context, comfort } = parsed.data;

  const result = await inferOccasion(basket, context, comfort);

  // first call fixes the baseline: categories the session already shops
  const { baseline } = await getSession(session_id);
  await upsertSession(session_id, {
    baseline: baseline.length ? baseline : [...new Set(basket.map((i) => i.category))],
    comfort,
  });
  await addEvents(
    session_id,
    result.suggestions.map((s) => ({
      product_id: s.product_id,
      category: s.category,
      event: "suggested" as const,
      occasion_id: result.occasion_id,
    })),
  );

  return Response.json(result);
}
