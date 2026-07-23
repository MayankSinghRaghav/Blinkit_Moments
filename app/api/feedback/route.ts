import { z } from "zod";
import { byId } from "@/lib/data/catalog";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";
import { addEvents, getSession } from "@/lib/store";
import { ADOPTION_DEPTH, ADOPTION_GOAL, adoptedCategories } from "@/lib/scoring";

export const runtime = "nodejs";

const Body = z.object({
  session_id: z.uuid(),
  product_id: z.string(),
  event: z.enum(["tried", "repeat", "dismissed"]),
  occasion_id: z.string().optional(),
});

/** Current adoption state for the tracker screen. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id");
  if (!id || !z.uuid().safeParse(id).success) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const { baseline, events } = await getSession(id);
  const suggested = events.filter((e) => e.event === "suggested").length;
  const dismissed = events.filter((e) => e.event === "dismissed").length;
  return Response.json({
    adopted: adoptedCategories(baseline, events),
    goal: ADOPTION_GOAL,
    depth: ADOPTION_DEPTH,
    // the experiment's annoyance guardrail, measurable from the same event log
    dismiss_rate: suggested ? Number((dismissed / suggested).toFixed(3)) : null,
    dismissed,
    suggested,
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

  try {
    await addEvents(parsed.data.session_id, [
      {
        product_id: product.id,
        category: product.category,
        event: parsed.data.event,
        occasion_id: parsed.data.occasion_id ?? null,
      },
    ]);
  } catch (e) {
    // recording IS the request — reporting success here would lose the event
    console.error("[feedback] write failed:", (e as Error).message);
    return Response.json({ error: "could not record event" }, { status: 500 });
  }

  const { baseline, events } = await getSession(parsed.data.session_id);
  const adopted = adoptedCategories(baseline, events);
  return Response.json({ adopted, goal: ADOPTION_GOAL, depth: ADOPTION_DEPTH });
}
