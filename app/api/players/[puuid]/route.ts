import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ puuid: string }> },
) {
  const { puuid } = await params;
  const player = await prisma.player.findUnique({
    where: { puuid },
    include: {
      stats: {
        include: {
          match: true,
          agent: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      heldBelts: true,
    },
  });

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(player);
}
