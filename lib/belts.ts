import { prisma } from "@/lib/prisma";
import { NormalizedMatch, selectWinningTeamMvp } from "@/lib/matches";

const GENERAL_BUCKET = "Overall";

export async function applyBeltRules(match: NormalizedMatch) {
  const winnerMvp = selectWinningTeamMvp(match.players);
  if (!winnerMvp || !match.actId) return;

  await applyBeltForBucket(match, winnerMvp.puuid, winnerMvp.acs, winnerMvp.rankBucket);
  await applyBeltForBucket(match, winnerMvp.puuid, winnerMvp.acs, GENERAL_BUCKET);
}

async function applyBeltForBucket(
  match: NormalizedMatch,
  winnerMvpPuuid: string,
  winnerMvpAcs: number,
  rankBucket: string,
) {
  const current = await prisma.beltState.findUnique({
    where: {
      region_rankBucket_actId: {
        region: match.region,
        rankBucket,
        actId: match.actId!,
      },
    },
  });

  if (!current) {
    await createInitialBelt(match, winnerMvpPuuid, winnerMvpAcs, rankBucket);
    return;
  }

  const currentHolderStat = match.players.find((player) => player.puuid === current.holderPuuid);
  if (!currentHolderStat || currentHolderStat.won) {
    return;
  }

  if (current.holderPuuid === winnerMvpPuuid) {
    return;
  }

  await prisma.$transaction([
    prisma.beltState.update({
      where: { id: current.id },
      data: {
        holderPuuid: winnerMvpPuuid,
        sourceMatchId: match.matchId,
        acquiredAt: match.startedAt ?? new Date(),
      },
    }),
    prisma.beltHistory.create({
      data: {
        region: match.region,
        rankBucket,
        actId: match.actId!,
        previousHolderPuuid: current.holderPuuid,
        newHolderPuuid: winnerMvpPuuid,
        matchId: match.matchId,
        mvpAcs: winnerMvpAcs,
        reason: "holder_lost",
        acquiredAt: match.startedAt ?? new Date(),
      },
    }),
  ]);
}

async function createInitialBelt(
  match: NormalizedMatch,
  holderPuuid: string,
  mvpAcs: number,
  rankBucket: string,
) {
  await prisma.$transaction([
    prisma.beltState.create({
      data: {
        region: match.region,
        rankBucket,
        actId: match.actId!,
        holderPuuid,
        sourceMatchId: match.matchId,
        acquiredAt: match.startedAt ?? new Date(),
      },
    }),
    prisma.beltHistory.create({
      data: {
        region: match.region,
        rankBucket,
        actId: match.actId!,
        previousHolderPuuid: null,
        newHolderPuuid: holderPuuid,
        matchId: match.matchId,
        mvpAcs,
        reason: "initial_highest_acs",
        acquiredAt: match.startedAt ?? new Date(),
      },
    }),
  ]);
}
