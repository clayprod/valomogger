import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") ?? process.env.RIOT_REGION ?? "americas";
  const rank = searchParams.get("rank");
  const act = searchParams.get("act") ?? (await getLatestAct(region));

  const states = await prisma.beltState.findMany({
    where: {
      region,
      ...(act ? { actId: act } : {}),
      ...(rank ? { rankBucket: rank } : {}),
    },
    include: {
      holder: true,
      match: true,
    },
    orderBy: [{ rankBucket: "asc" }],
  });

  const history = await prisma.beltHistory.findMany({
    where: {
      region,
      ...(act ? { actId: act } : {}),
      ...(rank ? { rankBucket: rank } : {}),
    },
    include: {
      previousHolder: true,
      newHolder: true,
      match: true,
    },
    orderBy: { acquiredAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ region, act, states, history });
}

async function getLatestAct(region: string) {
  const latest = await prisma.match.findFirst({
    where: { region, actId: { not: null } },
    orderBy: { startedAt: "desc" },
    select: { actId: true },
  });
  return latest?.actId ?? undefined;
}
