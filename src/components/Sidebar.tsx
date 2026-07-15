"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import {
  IconBoard,
  IconBook,
  IconCalendar,
  IconChart,
  IconLogout,
  IconSettings,
} from "./doodles";

const NAV = [
  { href: "/", label: "Pensum", icon: IconBoard },
  { href: "/materias", label: "Mis materias", icon: IconBook },
  { href: "/estadisticas", label: "Estadísticas", icon: IconChart },
  { href: "/calendario", label: "Calendario", icon: IconCalendar },
  { href: "/ajustes", label: "Ajustes", icon: IconSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useApp();

  return (
    <>
      {/* barra lateral en escritorio */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r-[3px] border-ink bg-cream lg:flex">
        <div className="flex items-center gap-2.5 border-b-2 border-dashed border-ink/30 px-5 py-5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink font-display text-base font-bold shadow-hard-sm"
            style={{ background: "var(--color-tangerine)", color: "var(--color-ink)" }}
          >
            π
          </div>
          <span className="font-display text-base font-bold text-ink">Mi Pensum</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 px-3 py-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 font-display text-sm font-semibold transition",
                  active
                    ? "border-ink bg-cobalt text-cream shadow-hard-sm"
                    : "border-transparent text-ink/70 hover:border-ink/30 hover:bg-[color:var(--color-paper-deep)]",
                ].join(" ")}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t-2 border-dashed border-ink/30 px-3 py-4">
          <div className="mb-2 truncate rounded-xl border-2 border-ink bg-[color:var(--color-paper-deep)] px-3 py-2">
            <p className="truncate text-xs font-bold text-ink">{user.name}</p>
            <p className="truncate text-[11px] font-semibold text-ink/50">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-cream px-3 py-2 font-display text-sm font-bold text-ink shadow-hard-sm transition hover:-translate-y-0.5"
          >
            <IconLogout className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* barra superior + tabs en móvil/tablet */}
      <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-cream/95 shadow-hard-sm backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-ink font-display text-sm font-bold"
              style={{ background: "var(--color-tangerine)", color: "var(--color-ink)" }}
            >
              π
            </div>
            <span className="font-display text-sm font-bold text-ink">Mi Pensum</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-[color:var(--color-paper-deep)] px-3 py-1.5 text-xs font-bold text-ink shadow-hard-sm"
          >
            <IconLogout className="h-3.5 w-3.5" />
            Salir
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-display text-xs font-bold transition",
                  active
                    ? "border-ink bg-cobalt text-cream shadow-hard-sm"
                    : "border-ink/20 text-ink/60",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
