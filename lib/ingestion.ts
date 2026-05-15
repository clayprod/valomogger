import { prisma } from "@/lib/prisma";
import { applyBeltRules } from "@/lib/belts";
import {
  getCurrentActId,
  getLeaderboard,
  getMatch,
  getMatchlistByPuuid,
  getValorantContent,
  type RiotContentResponse,
} from "@/lib/riot";
import { normalizeRiotMatch } from "@/lib/matches";

export async function syncValorantContent(): Promise<RiotContentResponse> {
  const content = await getValorantContent();
  const characters = content.characters ?? [];

  for (const character of characters) {
    await prisma.agent.upsert({
      where: { id: character.id },
      update: {
        name: character.name,
        localizedName: character.localizedNames?.["pt-BR"] ?? character.name,
        iconUrl: character.assetPath ?? character.assetName,
      },
      create: {
        id: character.id,
        name: character.name,
        localizedName: character.localizedNames?.["pt-BR"] ?? character.name,
        iconUrl: character.assetPath ?? character.assetName,
      },
    });
  }

  return content;
}

async function discoverCompetitiveMatchIds(actId: string, limit: number): Promise<string[]> {
  const leaderboard = await getLeaderboard(actId, Math.max(limit * 4, 40), 0);
  const puuids = (leaderboard.players ?? [])
    .map((p) => p.puuid)
    .filter((p): p is string => typeof p === "string" && p.length > 0);

  const matchIds: string[] = [];
  const seen = new Set<string>();

  for (const puuid of puuids) {
    if (matchIds.length >= limit) break;
    let matchlist;
    try {
      matchlist = await getMatchlistByPuuid(puuid);
    } catch {
      continue;
    }

    const competitive = (matchlist.history ?? [])
      .filter((entry) => (entry.queueId ?? "").toLowerCase() === "competitive")
      .sort((a, b) => (b.gameStartTimeMillis ?? 0) - (a.gameStartTimeMillis ?? 0));

    for (const entry of competitive) {
      if (seen.has(entry.matchId)) continue;
      seen.add(entry.matchId);
      matchIds.push(entry.matchId);
      if (matchIds.length >= limit) break;
    }
  }

  return matchIds;
}

export async function ingestRecentCompetitiveMatches(limit = 20) {
  const region = process.env.RIOT_REGION ?? "americas";
  const run = await prisma.ingestionRun.create({
    data: { region, queue: "competitive", status: "running" },
  });

  try {
    const content = await syncValorantContent();
    const actId = getCurrentActId(content);
    if (!actId) {
      throw new Error("Could not determine current Valorant act from content");
    }

    const matchIds = await discoverCompetitiveMatchIds(actId, limit);
    let imported = 0;
    let skipped = 0;

    for (const matchId of matchIds) {
      const exists = await prisma.match.findUnique({ where: { matchId } });
      if (exists) {
        skipped += 1;
        continue;
      }

      const raw = await getMatch(matchId);
      const match = normalizeRiotMatch(raw, region);
      await persistMatch(match, raw);
      await applyBeltRules(match);
      imported += 1;
    }

    return prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        discovered: matchIds.length,
        imported,
        skipped,
      },
    });
  } catch (error) {
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown ingestion error",
      },
    });
    throw error;
  }
}

async function persistMatch(match: ReturnType<typeof normalizeRiotMatch>, raw: unknown) {
  await prisma.$transaction(async (tx) => {
    for (const player of match.players) {
      if (player.agentId) {
        await tx.agent.upsert({
          where: { id: player.agentId },
          update: {},
          create: {
            id: player.agentId,
            name: player.agentId,
            localizedName: player.agentId,
          },
        });
      }

      await tx.player.upsert({
        where: { puuid: player.puuid },
        update: {
          gameName: player.gameName,
          tagLine: player.tagLine,
          region: match.region,
          lastSeenAt: match.startedAt ?? new Date(),
        },
        create: {
          puuid: player.puuid,
          gameName: player.gameName,
          tagLine: player.tagLine,
          region: match.region,
          lastSeenAt: match.startedAt ?? new Date(),
        },
      });
    }

    await tx.match.create({
      data: {
        matchId: match.matchId,
        region: match.region,
        queue: match.queue,
        actId: match.actId,
        mapName: match.mapName,
        startedAt: match.startedAt,
        roundsPlayed: match.roundsPlayed,
        winningTeamId: match.winningTeamId,
        raw: raw as object,
        stats: {
          create: match.players.map((player) => ({
            playerPuuid: player.puuid,
            agentId: player.agentId,
            region: match.region,
            actId: match.actId,
            teamId: player.teamId,
            won: player.won,
            rankTier: player.rankTier,
            rankBucket: player.rankBucket,
            score: player.score,
            rounds: player.rounds,
            acs: player.acs,
            kills: player.kills,
            deaths: player.deaths,
            assists: player.assists,
            kd: player.kd,
          })),
        },
      },
    });
  });
}
