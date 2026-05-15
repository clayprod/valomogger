import { NextResponse } from "next/server";
import { z } from "zod";
import { ingestRecentCompetitiveMatches } from "@/lib/ingestion";

const bodySchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const { limit } = bodySchema.parse(json);
  const run = await ingestRecentCompetitiveMatches(limit);

  return NextResponse.json(run);
}
