import { prisma } from "@/lib/prisma";
import type { LeaderboardRow } from "@/components/leaderboards/leaderboard-table";

export async function getLatestAct(region: string) {
  const latest = await prisma.match.findFirst({
    where: { region, actId: { not: null } },
    orderBy: { startedAt: "desc" },
    select: { actId: true },
  });
  return latest?.actId ?? undefined;
}

export async function getLeaderboardRows({
  region,
  act,
  rank,
  agent,
  take = 100,
}: {
  region: string;
  act?: string;
  rank?: string;
  agent?: string;
  take?: number;
}): Promise<LeaderboardRow[]> {
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
    take: 2000,
  });

  const grouped = new Map<string, LeaderboardRow & { acsTotal: number }>();
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
      avgAcs: 0,
      acsTotal: 0,
      kd: 0,
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

  return [...grouped.values()]
    .map(({ acsTotal, ...row }) => {
      const bestAgent = [...(agentCounts.get(row.puuid)?.entries() ?? [])].sort((a, b) => b[1] - a[1])[0]?.[0];
      return {
        ...row,
        bestAgent,
        avgAcs: row.matches > 0 ? acsTotal / row.matches : 0,
        kd: row.deaths > 0 ? row.kills / row.deaths : row.kills,
      };
    })
    .sort((a, b) => b.avgAcs - a.avgAcs)
    .slice(0, take);
}

export async function getAgentLeaderboard(region: string, act?: string) {
  const stats = await prisma.playerMatchStat.findMany({
    where: {
      region,
      ...(act ? { actId: act } : {}),
      agentId: { not: null },
    },
    include: {
      agent: true,
      player: true,
    },
    take: 3000,
  });

  const grouped = new Map<string, {
    agentId: string;
    agentName: string;
    playerPuuid: string;
    playerName: string;
    tagLine: string;
    rankBucket: string;
    matches: number;
    points: number;
  }>();

  for (const stat of stats) {
    if (!stat.agentId) continue;
    const key = `${stat.agentId}:${stat.playerPuuid}`;
    const current = grouped.get(key) ?? {
      agentId: stat.agentId,
      agentName: stat.agent?.localizedName ?? stat.agentId,
      playerPuuid: stat.playerPuuid,
      playerName: stat.player.gameName ?? "Unknown",
      tagLine: stat.player.tagLine ?? "",
      rankBucket: stat.rankBucket,
      matches: 0,
      points: 0,
    };

    current.matches += 1;
    current.points += stat.acs;
    current.rankBucket = stat.rankBucket;
    grouped.set(key, current);
  }

  return [...grouped.values()]
    .map((row) => ({
      ...row,
      avgAcs: row.matches > 0 ? row.points / row.matches : 0,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 25);
}
