const PLATFORM = process.env.RIOT_PLATFORM ?? "na";
const RIOT_BASE = `https://${PLATFORM}.api.riotgames.com`;

export type RiotContentAct = {
  id: string;
  name: string;
  isActive: boolean;
  type?: string;
};

export type RiotContentResponse = {
  characters?: Array<{
    id: string;
    name: string;
    localizedNames?: Record<string, string>;
    assetName?: string;
    assetPath?: string;
  }>;
  acts?: RiotContentAct[];
};

export type RiotLeaderboardEntry = {
  puuid?: string;
  gameName?: string;
  tagLine?: string;
  leaderboardRank?: number;
  rankedRating?: number;
};

export type RiotLeaderboardResponse = {
  shard?: string;
  actId?: string;
  totalPlayers?: number;
  players?: RiotLeaderboardEntry[];
};

export type RiotMatchlistEntry = {
  matchId: string;
  gameStartTimeMillis?: number;
  queueId?: string;
};

export type RiotMatchlistResponse = {
  puuid: string;
  history?: RiotMatchlistEntry[];
};

export async function riotFetch<T>(path: string): Promise<T> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) {
    throw new Error("RIOT_API_KEY is not configured");
  }

  const response = await fetch(`${RIOT_BASE}${path}`, {
    headers: {
      "X-Riot-Token": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const retryAfter = response.headers.get("retry-after");
    const message = `Riot API failed ${response.status}${retryAfter ? ` retry-after=${retryAfter}` : ""}`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function getValorantContent(locale = process.env.DEFAULT_LOCALE ?? "pt-BR") {
  return riotFetch<RiotContentResponse>(`/val/content/v1/contents?locale=${encodeURIComponent(locale)}`);
}

export function getLeaderboard(actId: string, size = 20, startIndex = 0) {
  return riotFetch<RiotLeaderboardResponse>(
    `/val/ranked/v1/leaderboards/by-act/${encodeURIComponent(actId)}?size=${size}&startIndex=${startIndex}`,
  );
}

export function getMatchlistByPuuid(puuid: string) {
  return riotFetch<RiotMatchlistResponse>(
    `/val/match/v1/matchlists/by-puuid/${encodeURIComponent(puuid)}`,
  );
}

export function getMatch(matchId: string) {
  return riotFetch<unknown>(`/val/match/v1/matches/${encodeURIComponent(matchId)}`);
}

export function getCurrentActId(content: RiotContentResponse): string | undefined {
  return content.acts?.find((act) => act.isActive && (act.type ?? "act").toLowerCase() === "act")?.id;
}
