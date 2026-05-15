import Link from "next/link";
import { Crown, Search, Shield } from "lucide-react";

const nav = [
  { href: "/", label: "Moggers" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/matches/demo", label: "Partidas" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-ink/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-black tracking-wide">
          <span className="grid h-9 w-9 place-items-center rounded bg-valorant text-white">
            <Crown size={20} />
          </span>
          <span>Valomogger</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-panelSoft hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden min-w-72 items-center gap-2 rounded border border-line bg-panel px-3 py-2 text-sm text-slate-400 sm:flex">
          <Search size={16} />
          <span>Buscar jogador na base local</span>
        </div>
        <div className="flex items-center gap-2 rounded border border-mint/40 bg-mint/10 px-3 py-2 text-xs font-bold text-mint">
          <Shield size={15} />
          Act atual
        </div>
      </div>
    </header>
  );
}
