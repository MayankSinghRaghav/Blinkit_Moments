import { z } from "zod";
import { byId } from "@/lib/data/catalog";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";
import { addEvents, getSession } from "@/lib/store";
import { ADOPTION_GOAL, adoptedCategories } from "@/lib/scoring";

export const runtime = "nodejs";

const Body = z.object({
  session_id: z.uuid(),
  product_id: z.string(),
  event: z.enum(["tried", "repeat"]),
  occasion_id: z.string().optional(),
});

/** Current adoption state for the tracker screen. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id");
  if (!id || !z.uuid().safeParse(id).success) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const { baseline, events } = await getSession(id);
  return Response.json({
    adopted: adoptedCategories(baseline, events),
    goal: ADOPTION_GOAL,
    baseline,
    events,
  });
}

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req.headers, "feedback"))) return tooMany();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });

  const product = byId(parsed.data.product_id);
  if (!product) return Response.json({ error: "unknown product" }, { status: 400 });

  await addEvents(parsed.data.session_id, [
    {
      product_id: product.id,
      category: product.category,
      event: parsed.data.event,
      occasion_id: parsed.data.occasion_id ?? null,
    },
  ]);

  const { baseline, events } = await getSession(parsed.data.session_id);
  const adopted = adoptedCategories(baseline, events);
  return Response.json({ adopted, goal: ADOPTION_GOAL });
}
