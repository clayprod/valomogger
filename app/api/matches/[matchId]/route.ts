import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const { matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { matchId },
    include: {
      stats: {
        include: {
          player: true,
          agent: true,
        },
        orderBy: [{ acs: "desc" }],
      },
      beltHistory: {
        include: {
          previousHolder: true,
          newHolder: true,
        },
      },
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}
