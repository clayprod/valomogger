import Link from "next/link";
import { formatNumber } from "@/lib/utils";

type MatchStat = {
  id: string;
  playerPuuid: string;
  teamId: string;
  won: boolean;
  rankBucket: string;
  acs: number;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  agent?: { localizedName: string } | null;
  player: { puuid: string; gameName: string | null; tagLine: string | null };
};

export function MatchScoreboard({ stats }: { stats: MatchStat[] }) {
  const ordered = [...stats].sort((a, b) => Number(b.won) - Number(a.won) || b.acs - a.acs);

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-teal-900/60 text-xs uppercase tracking-wide text-slate-200">
            <tr>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Jogador</th>
              <th className="px-4 py-3 text-left">Agente</th>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-right">ACS</th>
              <th className="px-4 py-3 text-right">K</th>
              <th className="px-4 py-3 text-right">D</th>
              <th className="px-4 py-3 text-right">A</th>
              <th className="px-4 py-3 text-right">K/D</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((stat) => (
              <tr key={stat.id} className="border-t border-line/70 odd:bg-ink/30">
                <td className={stat.won ? "px-4 py-3 font-black text-mint" : "px-4 py-3 font-black text-valorant"}>
                  {stat.teamId}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/players/${stat.player.puuid}`} className="font-black hover:text-mint">
                    {stat.player.gameName ?? "Unknown"}
                  </Link>
                  <span className="ml-1 text-xs text-slate-400">#{stat.player.tagLine || "----"}</span>
                </td>
                <td className="px-4 py-3 text-slate-300">{stat.agent?.localizedName ?? "N/D"}</td>
                <td className="px-4 py-3 text-slate-300">{stat.rankBucket}</td>
                <td className="px-4 py-3 text-right font-black text-mint">{formatNumber(stat.acs, 1)}</td>
                <td className="px-4 py-3 text-right">{stat.kills}</td>
                <td className="px-4 py-3 text-right">{stat.deaths}</td>
                <td className="px-4 py-3 text-right">{stat.assists}</td>
                <td className="px-4 py-3 text-right">{formatNumber(stat.kd, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
