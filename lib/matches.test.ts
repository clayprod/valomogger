import { describe, expect, it } from "vitest";
import { compareMvp, normalizeRiotMatch, selectWinningTeamMvp } from "@/lib/matches";

describe("match normalization", () => {
  it("computes ACS from score divided by rounds", () => {
    const match = normalizeRiotMatch(
      {
        metadata: {
          matchId: "match-1",
          queueId: "competitive",
          seasonId: "act-1",
          gameStartMillis: 1710000000000,
          mapId: "Ascent",
        },
        teams: [
          { teamId: "Blue", won: false, roundsPlayed: 18 },
          { teamId: "Red", won: true, roundsPlayed: 18 },
        ],
        players: [
          {
            puuid: "p1",
            gameName: "Holder",
            tagLine: "BR1",
            teamId: "Blue",
            characterId: "jett",
            competitiveTier: 27,
            stats: { score: 3600, roundsPlayed: 18, kills: 20, deaths: 15, assists: 4 },
          },
          {
            puuid: "p2",
            gameName: "Challenger",
            tagLine: "BR1",
            teamId: "Red",
            characterId: "raze",
            competitiveTier: 24,
            stats: { score: 4500, roundsPlayed: 18, kills: 24, deaths: 12, assists: 5 },
          },
        ],
      },
      "americas",
    );

    expect(match.matchId).toBe("match-1");
    expect(match.players[1].acs).toBe(250);
    expect(match.players[1].rankBucket).toBe("Immortal");
    expect(match.players[1].won).toBe(true);
  });

  it("selects the MVP from the winning team for belt succession", () => {
    const mvp = selectWinningTeamMvp([
      makePlayer({ puuid: "losing-star", won: false, acs: 400, kills: 30 }),
      makePlayer({ puuid: "winner", won: true, acs: 260, kills: 18 }),
      makePlayer({ puuid: "winner-2", won: true, acs: 240, kills: 17 }),
    ]);

    expect(mvp?.puuid).toBe("winner");
  });

  it("breaks ACS ties by win, K/D, then kills", () => {
    const tied = [
      makePlayer({ puuid: "a", won: false, acs: 300, kd: 2, kills: 20 }),
      makePlayer({ puuid: "b", won: true, acs: 300, kd: 1.2, kills: 18 }),
      makePlayer({ puuid: "c", won: true, acs: 300, kd: 1.2, kills: 17 }),
    ].sort(compareMvp);

    expect(tied[0].puuid).toBe("b");
  });
});

function makePlayer(overrides: Partial<ReturnType<typeof basePlayer>>) {
  return { ...basePlayer(), ...overrides };
}

function basePlayer() {
  return {
    puuid: "p",
    gameName: "Player",
    tagLine: "BR1",
    teamId: "Blue",
    won: true,
    agentId: "jett",
    rankTier: 27,
    rankBucket: "Radiant",
    score: 3000,
    rounds: 20,
    acs: 150,
    kills: 10,
    deaths: 10,
    assists: 2,
    kd: 1,
  };
}
