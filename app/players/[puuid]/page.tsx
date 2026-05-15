import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlayerPage({ params }: { params: Promise<{ puuid: string }> }) {
  const { puuid } = await params;
  const player = await prisma.player.findUnique({
    where: { puuid },
    include: {
      stats: {
        include: { match: true, agent: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      heldBelts: true,
    },
  });

  if (!player) notFound();

  const avgAcs = player.stats.reduce((sum, stat) => sum + stat.acs, 0) / Math.max(player.stats.length, 1);
  const kills = player.stats.reduce((sum, stat) => sum + stat.kills, 0);
  const deaths = player.stats.reduce((sum, stat) => sum + stat.deaths, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-mint">{player.region}</p>
        <h1 className="mt-2 text-5xl font-black">{player.gameName ?? "Unknown"}</h1>
        <p className="mt-1 text-slate-400">#{player.tagLine || "----"}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Metric label="ACS medio" value={formatNumber(avgAcs, 1)} />
          <Metric label="K/D" value={formatNumber(deaths > 0 ? kills / deaths : kills, 2)} />
          <Metric label="Partidas" value={player.stats.length.toString()} />
          <Metric label="Cinturoes" value={player.heldBelts.length.toString()} />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel p-4">
        <h2 className="text-2xl font-black">Partidas recentes</h2>
        <div className="mt-4 divide-y divide-line">
          {player.stats.map((stat) => (
            <div key={stat.id} className="grid gap-3 py-4 md:grid-cols-[1fr_120px_120px_120px] md:items-center">
              <div>
                <p className="font-black">{stat.match.mapName ?? stat.match.matchId}</p>
                <p className="text-xs text-slate-400">{formatDateTime(stat.match.startedAt)} · {stat.agent?.localizedName ?? "N/D"}</p>
              </div>
              <p className={stat.won ? "font-black text-mint" : "font-black text-valorant"}>{stat.won ? "Vitoria" : "Derrota"}</p>
              <p className="font-black text-gold">{stat.rankBucket}</p>
              <p className="text-right font-black text-mint">ACS {formatNumber(stat.acs, 1)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-ink/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
