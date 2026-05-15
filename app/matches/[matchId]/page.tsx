import { notFound } from "next/navigation";
import { MatchScoreboard } from "@/components/matches/match-scoreboard";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { matchId },
    include: {
      stats: {
        include: { player: true, agent: true },
        orderBy: { acs: "desc" },
      },
      beltHistory: {
        include: { previousHolder: true, newHolder: true },
      },
    },
  });

  if (!match) notFound();

  const winner = match.stats.find((stat) => stat.won);
  const mvp = match.stats[0];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-line bg-panel p-5">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-valorant">Competitive · {match.region}</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <h1 className="text-4xl font-black">{match.mapName ?? "Partida"}</h1>
            <p className="mt-2 text-slate-400">{formatDateTime(match.startedAt)} · {match.roundsPlayed} rounds</p>
          </div>
          <div className="rounded border border-line bg-ink/60 p-4">
            <p className="text-xs text-slate-400">Vencedor</p>
            <p className="text-2xl font-black text-mint">{winner?.teamId ?? match.winningTeamId ?? "N/D"}</p>
          </div>
          <div className="rounded border border-line bg-ink/60 p-4">
            <p className="text-xs text-slate-400">MVP</p>
            <p className="text-2xl font-black text-gold">{mvp?.player.gameName ?? "N/D"}</p>
          </div>
        </div>
      </div>
      <MatchScoreboard stats={match.stats} />
    </div>
  );
}
