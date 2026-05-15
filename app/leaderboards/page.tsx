import { LeaderboardTable } from "@/components/leaderboards/leaderboard-table";
import { getLatestAct, getLeaderboardRows } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LeaderboardsPage() {
  const region = process.env.RIOT_REGION ?? "americas";
  const act = await getLatestAct(region);
  const rows = await getLeaderboardRows({ region, act, take: 100 });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-valorant">Competitive · {region}</p>
        <h1 className="mt-2 text-4xl font-black">Leaderboards por ACS</h1>
        <p className="mt-2 text-slate-400">Todos os jogadores ingeridos na base pontuam. No v1, pontos por agente usam ACS puro.</p>
      </div>
      <LeaderboardTable rows={rows} />
    </div>
  );
}
