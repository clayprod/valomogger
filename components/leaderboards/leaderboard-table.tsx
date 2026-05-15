import Link from "next/link";
import { Medal } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export type LeaderboardRow = {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  rankBucket: string;
  matches: number;
  wins: number;
  avgAcs: number;
  kd: number;
  kills: number;
  deaths: number;
  assists: number;
  bestAgent?: string;
};

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-panel/70 p-8 text-center text-slate-400">
        Nenhuma partida ingerida ainda. Rode a ingestao para popular os rankings.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-panelSoft text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Jogador</th>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Agente</th>
              <th className="px-4 py-3 text-right">ACS</th>
              <th className="px-4 py-3 text-right">K/D</th>
              <th className="px-4 py-3 text-right">K/A/D</th>
              <th className="px-4 py-3 text-right">Win %</th>
              <th className="px-4 py-3 text-right">Partidas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.puuid} className="border-t border-line/70 odd:bg-ink/30 hover:bg-panelSoft/80">
                <td className="px-4 py-3 font-black text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    {index < 3 ? <Medal size={16} className="text-gold" /> : null}
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/players/${row.puuid}`} className="font-black hover:text-mint">
                    {row.gameName}
                  </Link>
                  <span className="ml-1 text-xs text-slate-400">#{row.tagLine || "----"}</span>
                </td>
                <td className="px-4 py-3 text-slate-300">{row.rankBucket}</td>
                <td className="px-4 py-3 text-slate-300">{row.bestAgent ?? "N/D"}</td>
                <td className="px-4 py-3 text-right font-black text-mint">{formatNumber(row.avgAcs, 1)}</td>
                <td className="px-4 py-3 text-right font-bold">{formatNumber(row.kd, 2)}</td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {row.kills}/{row.assists}/{row.deaths}
                </td>
                <td className="px-4 py-3 text-right">{formatNumber(row.matches ? (row.wins / row.matches) * 100 : 0, 1)}%</td>
                <td className="px-4 py-3 text-right">{row.matches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
