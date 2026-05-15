import Link from "next/link";
import { Crown, Swords } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";

type BeltCardProps = {
  rankBucket: string;
  holder: {
    puuid: string;
    gameName: string | null;
    tagLine: string | null;
  };
  acquiredAt: Date;
  matchId?: string | null;
  mvpAcs?: number;
};

export function BeltCard({ rankBucket, holder, acquiredAt, matchId, mvpAcs }: BeltCardProps) {
  return (
    <article className="rounded-lg border border-line bg-panel p-4 shadow-glow">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gold">
          <Crown size={20} />
          <span className="text-sm font-black uppercase tracking-wide">{rankBucket}</span>
        </div>
        {matchId ? (
          <Link href={`/matches/${matchId}`} className="text-xs font-bold text-slate-400 hover:text-white">
            Ver tomada
          </Link>
        ) : null}
      </div>
      <Link href={`/players/${holder.puuid}`} className="block">
        <h3 className="truncate text-xl font-black">{holder.gameName ?? "Unknown"}</h3>
        <p className="text-sm font-semibold text-slate-400">#{holder.tagLine || "----"}</p>
      </Link>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded border border-line bg-ink/60 p-3">
          <p className="text-slate-400">Desde</p>
          <p className="mt-1 font-bold">{formatDateTime(acquiredAt)}</p>
        </div>
        <div className="rounded border border-line bg-ink/60 p-3">
          <p className="flex items-center gap-1 text-slate-400">
            <Swords size={14} />
            ACS tomada
          </p>
          <p className="mt-1 font-bold">{typeof mvpAcs === "number" ? formatNumber(mvpAcs, 1) : "N/D"}</p>
        </div>
      </div>
    </article>
  );
}
