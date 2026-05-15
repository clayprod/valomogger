import { BeltCard } from "@/components/moggers/belt-card";
import { prisma } from "@/lib/prisma";
import { getLatestAct } from "@/lib/queries";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MoggersPage() {
  const region = process.env.RIOT_REGION ?? "americas";
  const act = await getLatestAct(region);
  const [states, history] = await Promise.all([
    prisma.beltState.findMany({
      where: { region, ...(act ? { actId: act } : {}) },
      include: { holder: true },
      orderBy: { rankBucket: "asc" },
    }),
    prisma.beltHistory.findMany({
      where: { region, ...(act ? { actId: act } : {}) },
      include: { previousHolder: true, newHolder: true, match: true },
      orderBy: { acquiredAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-gold">Cinturoes · {region}</p>
        <h1 className="mt-2 text-4xl font-black">Moggers atuais</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Cada rank tem seu Mogger. O Mogger geral ignora rank. O cinturão só troca quando o dono perde uma partida e o MVP do time vencedor toma o lugar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {states.map((state) => (
          <BeltCard
            key={state.id}
            rankBucket={state.rankBucket === "Overall" ? "Mogger geral" : state.rankBucket}
            holder={state.holder}
            acquiredAt={state.acquiredAt}
            matchId={state.sourceMatchId}
          />
        ))}
      </div>

      <section className="rounded-lg border border-line bg-panel p-4">
        <h2 className="text-2xl font-black">Historico de tomadas</h2>
        <div className="mt-4 divide-y divide-line">
          {history.length === 0 ? (
            <p className="py-8 text-center text-slate-400">Nenhum cinturão criado ainda.</p>
          ) : history.map((item) => (
            <div key={item.id} className="grid gap-3 py-4 md:grid-cols-[160px_1fr_140px] md:items-center">
              <div>
                <p className="font-black text-gold">{item.rankBucket === "Overall" ? "Geral" : item.rankBucket}</p>
                <p className="text-xs text-slate-400">{formatDateTime(item.acquiredAt)}</p>
              </div>
              <p className="text-slate-300">
                <span className="font-black text-white">{item.newHolder.gameName ?? "Unknown"}</span>
                {item.previousHolder ? (
                  <> tomou de <span className="font-black text-white">{item.previousHolder.gameName ?? "Unknown"}</span></>
                ) : " abriu o cinturão"}
                {item.match?.mapName ? <> em {item.match.mapName}</> : null}
              </p>
              <p className="text-right font-black text-mint">ACS {formatNumber(item.mvpAcs, 1)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
