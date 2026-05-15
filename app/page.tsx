import Link from "next/link";
import { Activity, Crown, Database, Swords } from "lucide-react";
import { BeltCard } from "@/components/moggers/belt-card";
import { LeaderboardTable } from "@/components/leaderboards/leaderboard-table";
import { prisma } from "@/lib/prisma";
import { getAgentLeaderboard, getLatestAct, getLeaderboardRows } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const region = process.env.RIOT_REGION ?? "americas";
  const act = await getLatestAct(region);
  const [belts, topRows, agentRows, totals] = await Promise.all([
    prisma.beltState.findMany({
      where: { region, ...(act ? { actId: act } : {}) },
      include: { holder: true },
      orderBy: { rankBucket: "asc" },
      take: 10,
    }),
    getLeaderboardRows({ region, act, take: 10 }),
    getAgentLeaderboard(region, act),
    getTotals(region, act),
  ]);

  const overall = belts.find((belt) => belt.rankBucket === "Overall");

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-line bg-panel/90 p-6 shadow-glow">
          <div className="flex items-center gap-3 text-valorant">
            <Crown size={28} />
            <span className="text-sm font-black uppercase tracking-[0.22em]">Cinturao atual</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            O Mogger segura o cinturao ate perder uma Competitive.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Quando ele perde, o MVP do time vencedor vira o novo Mogger. Rankings e cinturões rodam por regiao, rank e Act.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric icon={<Database size={18} />} label="Partidas" value={totals.matches.toString()} />
            <Metric icon={<Activity size={18} />} label="Jogadores" value={totals.players.toString()} />
            <Metric icon={<Swords size={18} />} label="ACS medio" value={formatNumber(totals.avgAcs, 1)} />
          </div>
        </div>
        {overall ? (
          <BeltCard
            rankBucket="Mogger geral"
            holder={overall.holder}
            acquiredAt={overall.acquiredAt}
            matchId={overall.sourceMatchId}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-panel/70 p-6">
            <p className="text-sm font-black uppercase tracking-wide text-slate-400">Mogger geral</p>
            <h2 className="mt-3 text-3xl font-black">Aguardando ingestao</h2>
            <p className="mt-2 text-slate-400">Assim que partidas Competitive entrarem na base, o primeiro cinturão será definido.</p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Cinturoes por rank</h2>
          <Link href="/moggers" className="text-sm font-bold text-mint hover:text-white">Ver todos</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {belts.filter((belt) => belt.rankBucket !== "Overall").slice(0, 6).map((belt) => (
            <BeltCard
              key={belt.id}
              rankBucket={belt.rankBucket}
              holder={belt.holder}
              acquiredAt={belt.acquiredAt}
              matchId={belt.sourceMatchId}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Leaderboard geral</h2>
            <Link href="/leaderboards" className="text-sm font-bold text-mint hover:text-white">Abrir leaderboard</Link>
          </div>
          <LeaderboardTable rows={topRows} />
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <h2 className="text-xl font-black">Melhores por agente</h2>
          <div className="mt-4 space-y-3">
            {agentRows.length === 0 ? (
              <p className="text-sm text-slate-400">Sem dados de agentes ainda.</p>
            ) : agentRows.map((row, index) => (
              <Link
                key={`${row.agentId}:${row.playerPuuid}`}
                href={`/players/${row.playerPuuid}`}
                className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded border border-line bg-ink/50 p-3 hover:border-mint/60"
              >
                <span className="font-black text-slate-400">{index + 1}</span>
                <span>
                  <span className="block font-black">{row.playerName}</span>
                  <span className="text-xs text-slate-400">{row.agentName} · {row.rankBucket}</span>
                </span>
                <span className="font-black text-mint">{formatNumber(row.points, 0)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-ink/70 p-4">
      <div className="flex items-center gap-2 text-slate-400">{icon}<span className="text-sm">{label}</span></div>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

async function getTotals(region: string, act?: string) {
  const [matches, players, acs] = await Promise.all([
    prisma.match.count({ where: { region, ...(act ? { actId: act } : {}) } }),
    prisma.player.count({ where: { region } }),
    prisma.playerMatchStat.aggregate({
      where: { region, ...(act ? { actId: act } : {}) },
      _avg: { acs: true },
    }),
  ]);

  return { matches, players, avgAcs: acs._avg.acs ?? 0 };
}
