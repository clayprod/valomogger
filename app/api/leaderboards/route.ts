import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") ?? process.env.RIOT_REGION ?? "americas";
  const rank = searchParams.get("rank");
  const agent = searchParams.get("agent");
  const act = searchParams.get("act") ?? (await getLatestAct(region));

  const stats = await prisma.playerMatchStat.findMany({
    where: {
      region,
      ...(act ? { actId: act } : {}),
      ...(rank ? { rankBucket: rank } : {}),
      ...(agent ? { agentId: agent } : {}),
    },
    include: {
      player: true,
      agent: true,
    },
    orderBy: [{ acs: "desc" }],
    take: 1000,
  });

  const grouped = new Map<string, {
    puuid: string;
    gameName: string;
    tagLine: string;
    region: string;
    rankBucket: string;
    matches: number;
    wins: number;
    acsTotal: number;
    kills: number;
    deaths: number;
    assists: number;
    bestAgent?: string;
  }>();

  const agentCounts = new Map<string, Map<string, number>>();

  for (const stat of stats) {
    const current = grouped.get(stat.playerPuuid) ?? {
      puuid: stat.playerPuuid,
      gameName: stat.player.gameName ?? "Unknown",
      tagLine: stat.player.tagLine ?? "",
      region: stat.region,
      rankBucket: stat.rankBucket,
      matches: 0,
      wins: 0,
      acsTotal: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
    };

    current.matches += 1;
    current.wins += stat.won ? 1 : 0;
    current.acsTotal += stat.acs;
    current.kills += stat.kills;
    current.deaths += stat.deaths;
    current.assists += stat.assists;
    current.rankBucket = stat.rankBucket;
    grouped.set(stat.playerPuuid, current);

    if (stat.agent?.localizedName) {
      const counts = agentCounts.get(stat.playerPuuid) ?? new Map<string, number>();
      counts.set(stat.agent.localizedName, (counts.get(stat.agent.localizedName) ?? 0) + 1);
      agentCounts.set(stat.playerPuuid, counts);
    }
  }

  const rows = [...grouped.values()]
    .map((row) => {
      const bestAgent = [...(agentCounts.get(row.puuid)?.entries() ?? [])].sort((a, b) => b[1] - a[1])[0]?.[0];
      return {
        ...row,
        bestAgent,
        avgAcs: row.matches > 0 ? row.acsTotal / row.matches : 0,
        kd: row.deaths > 0 ? row.kills / row.deaths : row.kills,
        winRate: row.matches > 0 ? row.wins / row.matches : 0,
      };
    })
    .sort((a, b) => b.avgAcs - a.avgAcs)
    .slice(0, 100);

  return NextResponse.json({ region, act, rows });
}

async function getLatestAct(region: string) {
  const latest = await prisma.match.findFirst({
    where: { region, actId: { not: null } },
    orderBy: { startedAt: "desc" },
    select: { actId: true },
  });
  return latest?.actId ?? undefined;
}
