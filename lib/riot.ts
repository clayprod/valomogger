const RIOT_BASE = `https://${process.env.RIOT_REGION ?? "americas"}.api.riotgames.com`;

export type RiotRecentMatchesResponse = {
  currentTime?: number;
  matchIds?: string[];
};

export type RiotContentResponse = {
  characters?: Array<{
    id: string;
    name: string;
    localizedNames?: Record<string, string>;
    assetName?: string;
    assetPath?: string;
  }>;
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

export function getRecentCompetitiveMatches() {
  return riotFetch<RiotRecentMatchesResponse>("/val/match/v1/recent-matches/by-queue/competitive");
}

export function getMatch(matchId: string) {
  return riotFetch<unknown>(`/val/match/v1/matches/${encodeURIComponent(matchId)}`);
}

export function getValorantContent(locale = process.env.DEFAULT_LOCALE ?? "pt-BR") {
  return riotFetch<RiotContentResponse>(`/val/content/v1/contents?locale=${encodeURIComponent(locale)}`);
}
