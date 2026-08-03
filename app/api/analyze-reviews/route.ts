import { z } from "zod";
import { analyzeReviews } from "@/lib/llm";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Body = z.object({
  reviews: z.array(z.string()).min(1).max(50),
});

/** P2 — live review-analysis workflow. Tags + clusters + scores pasted reviews
 * via the LLM, grounded only in the input. Falls back to keyword clustering. */
export async function POST(req: Request) {
  if (!rateLimit(clientKey(req.headers, "analyze"), 10)) return tooMany();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });

  const result = await analyzeReviews(parsed.data.reviews);
  return Response.json(result);
}
