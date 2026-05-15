import { rankBucketFromTier } from "@/lib/ranks";

type AnyRecord = Record<string, unknown>;

export type NormalizedPlayerStat = {
  puuid: string;
  gameName?: string;
  tagLine?: string;
  teamId: string;
  won: boolean;
  agentId?: string;
  rankTier?: number;
  rankBucket: string;
  score: number;
  rounds: number;
  acs: number;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
};

export type NormalizedMatch = {
  matchId: string;
  region: string;
  queue: string;
  actId?: string;
  mapName?: string;
  startedAt?: Date;
  roundsPlayed: number;
  winningTeamId?: string;
  players: NormalizedPlayerStat[];
};

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function normalizeRiotMatch(raw: unknown, fallbackRegion: string): NormalizedMatch {
  const root = asRecord(raw);
  const metadata = asRecord(root.metadata);
  const teams = asArray(root.teams).map(asRecord);
  const players = asArray(root.players).map(asRecord);
  const winningTeam = teams.find((team) => team.won === true);

  const matchId = asString(metadata.matchId) ?? asString(metadata.matchid) ?? asString(root.matchId);
  if (!matchId) {
    throw new Error("Riot match payload missing matchId");
  }

  const queue = asString(metadata.queueId) ?? "competitive";
  const actId = asString(metadata.seasonId);
  const startedAtMillis = asNumber(metadata.gameStartMillis);
  const winningTeamId = asString(winningTeam?.teamId);
  const roundsPlayed =
    teams.reduce((max, team) => Math.max(max, asNumber(team.roundsPlayed) ?? 0), 0) ||
    players.reduce((max, player) => Math.max(max, asNumber(asRecord(player.stats).roundsPlayed) ?? 0), 0);

  return {
    matchId,
    region: fallbackRegion,
    queue,
    actId,
    mapName: asString(metadata.mapId),
    startedAt: startedAtMillis ? new Date(startedAtMillis) : undefined,
    roundsPlayed,
    winningTeamId,
    players: players.flatMap((player) => {
      const puuid = asString(player.puuid);
      const teamId = asString(player.teamId);
      if (!puuid || !teamId) return [];

      const stats = asRecord(player.stats);
      const score = asNumber(stats.score) ?? 0;
      const rounds = (asNumber(stats.roundsPlayed) ?? roundsPlayed) || 1;
      const kills = asNumber(stats.kills) ?? 0;
      const deaths = asNumber(stats.deaths) ?? 0;
      const assists = asNumber(stats.assists) ?? 0;
      const rankTier = asNumber(player.competitiveTier);
      const won = Boolean(winningTeamId && teamId === winningTeamId);
      const acs = rounds > 0 ? score / rounds : 0;

      return [
        {
          puuid,
          gameName: asString(player.gameName),
          tagLine: asString(player.tagLine),
          teamId,
          won,
          agentId: asString(player.characterId),
          rankTier,
          rankBucket: rankBucketFromTier(rankTier),
          score,
          rounds,
          acs,
          kills,
          deaths,
          assists,
          kd: deaths > 0 ? kills / deaths : kills,
        },
      ];
    }),
  };
}

export function selectMatchMvp(players: NormalizedPlayerStat[]) {
  return [...players].sort(compareMvp)[0];
}

export function selectWinningTeamMvp(players: NormalizedPlayerStat[]) {
  return selectMatchMvp(players.filter((player) => player.won));
}

export function compareMvp(a: NormalizedPlayerStat, b: NormalizedPlayerStat) {
  return (
    b.acs - a.acs ||
    Number(b.won) - Number(a.won) ||
    b.kd - a.kd ||
    b.kills - a.kills ||
    a.deaths - b.deaths ||
    a.puuid.localeCompare(b.puuid)
  );
}
