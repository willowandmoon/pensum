"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { CAREERS } from "@/lib/types";
import {
  IconBoard,
  IconBook,
  IconCalendar,
  IconChart,
  IconLogout,
  IconSettings,
} from "./doodles";

const NAV = [
  { href: "/", label: "Pensum", shortLabel: "Pensum", icon: IconBoard },
  { href: "/materias", label: "Mis materias", shortLabel: "Materias", icon: IconBook },
  { href: "/estadisticas", label: "Estadísticas", shortLabel: "Stats", icon: IconChart },
  { href: "/calendario", label: "Calendario", shortLabel: "Calendario", icon: IconCalendar },
  { href: "/ajustes", label: "Ajustes", shortLabel: "Ajustes", icon: IconSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useApp();
  const careerLabel = CAREERS.find((c) => c.value === user.career)?.label ?? user.career;
  const [careerFirstWord, ...careerRestWords] = careerLabel.split(" ");
  const careerRest = careerRestWords.join(" ");

  return (
    <>
      {/* barra lateral en escritorio */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r-[3px] border-ink bg-cream lg:flex">
        <div className="border-b-2 border-dashed border-ink/30 px-5 py-5">
          <span className="font-display text-base font-bold leading-tight text-ink">
            <span className="block">{careerFirstWord}</span>
            {careerRest && <span className="block">{careerRest}</span>}
          </span>
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

      {/* barra superior en móvil/tablet: solo carrera + salir */}
      <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-cream/95 shadow-hard-sm backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="font-display text-sm font-bold leading-tight text-ink">
            <span className="block">{careerFirstWord}</span>
            {careerRest && <span className="block">{careerRest}</span>}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-[color:var(--color-paper-deep)] px-3 py-1.5 text-xs font-bold text-ink shadow-hard-sm"
          >
            <IconLogout className="h-3.5 w-3.5" />
            Salir
          </button>
        </div>
      </header>

      {/* barra de navegación fija abajo en móvil/tablet */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t-[3px] border-ink bg-cream/95 shadow-hard backdrop-blur lg:hidden">
        {NAV.map(({ href, label, shortLabel, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold"
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition",
                  active
                    ? "border-ink bg-cobalt text-cream shadow-hard-sm"
                    : "border-transparent text-ink/50",
                ].join(" ")}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className={active ? "text-ink" : "text-ink/50"}>{shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
