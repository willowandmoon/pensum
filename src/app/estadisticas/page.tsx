"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { IconBoard, IconBook, IconCalendar, IconChart, Sparkle } from "@/components/doodles";
import { MAX_SCORE, TOTAL_CREDITS, summarizeGrades } from "@/lib/types";

function StatCard({
  icon,
  iconBg,
  title,
  value,
  suffix,
  sub,
  subColor,
  progress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  suffix?: string;
  sub: string;
  subColor: string;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border-[2.5px] border-ink bg-cream p-4 shadow-hard">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-ink"
          style={{ background: iconBg }}
        >
          {icon}
        </span>
        <span className="font-sans text-xs font-bold text-ink/60">{title}</span>
      </div>
      <p className="font-display text-3xl font-bold leading-none text-ink">
        {value}
        {suffix && <span className="text-base font-semibold text-ink/40"> {suffix}</span>}
      </p>
      {typeof progress === "number" ? (
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[color:var(--color-paper-deep)]">
          <div
            className="h-full rounded-full bg-grass transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      <p className="mt-2 text-xs font-bold" style={{ color: subColor }}>
        {sub}
      </p>
    </div>
  );
}

export default function EstadisticasPage() {
  const { user, courses, statuses, lockedCodes, grades, completedCredits, pct } = useApp();

  const completedCount = useMemo(
    () => courses.filter((c) => statuses[c.code] === "completed").length,
    [courses, statuses]
  );
  const currentCount = useMemo(
    () => courses.filter((c) => statuses[c.code] === "current").length,
    [courses, statuses]
  );
  const availableCount = useMemo(
    () =>
      courses.filter(
        (c) => (statuses[c.code] ?? "pending") === "pending" && !lockedCodes.has(c.code)
      ).length,
    [courses, statuses, lockedCodes]
  );
  const blockedCount = useMemo(
    () =>
      courses.filter(
        (c) => (statuses[c.code] ?? "pending") === "pending" && lockedCodes.has(c.code)
      ).length,
    [courses, statuses, lockedCodes]
  );

  const remainingCount = courses.length - completedCount;
  const remainingCredits = TOTAL_CREDITS - completedCredits;

  const generalAverage = useMemo(() => {
    const byCourse = new Map<string, typeof grades>();
    for (const g of grades) {
      if (!byCourse.has(g.courseCode)) byCourse.set(g.courseCode, []);
      byCourse.get(g.courseCode)!.push(g);
    }
    const finals: number[] = [];
    for (const [code, courseGrades] of byCourse) {
      if (statuses[code] !== "completed") continue;
      const summary = summarizeGrades(courseGrades);
      if (summary.isFinal) finals.push(summary.accumulated);
    }
    if (finals.length === 0) return null;
    return finals.reduce((a, b) => a + b, 0) / finals.length;
  }, [grades, statuses]);

  const averageLabel =
    generalAverage === null
      ? "Sin datos"
      : generalAverage >= 4.5
        ? "Excelente"
        : generalAverage >= 4.0
          ? "Muy bueno"
          : generalAverage >= 3.5
            ? "Bueno"
            : generalAverage >= 3.0
              ? "Aceptable"
              : "Necesita mejorar";

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  const legend = [
    { label: "Aprobadas", count: completedCount, color: "var(--color-grass)" },
    { label: "Cursando", count: currentCount, color: "var(--color-cobalt)" },
    { label: "Disponibles", count: availableCount, color: "var(--color-tangerine)" },
    { label: "Bloqueadas", count: blockedCount, color: "#9a9a9a" },
  ];

  const message =
    pct >= 100
      ? "¡Completaste todo el pensum! Felicitaciones."
      : pct >= 75
        ? `¡Vas muy bien! Llevas ${completedCredits} créditos aprobados. Sigue así.`
        : pct >= 50
          ? "Vas por buen camino, ya pasaste la mitad del pensum."
          : pct >= 25
            ? "Vas arrancando con buen ritmo, sigue así."
            : pct > 0
              ? "Apenas estás comenzando, cada crédito cuenta."
              : `Bienvenido, ${user.name.split(" ")[0]}. Marca tus materias vistas en el Pensum para ver tu progreso aquí.`;

  return (
    <div className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-ink">Estadísticas</h1>
        <p className="text-xs font-semibold text-ink/60">
          Tu avance en Ingeniería Informática, de un vistazo.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<IconBoard className="h-4 w-4 text-cream" />}
          iconBg="var(--color-grass)"
          title="Créditos aprobados"
          value={`${completedCredits}`}
          suffix={`/ ${TOTAL_CREDITS}`}
          progress={pct}
          sub={`${pct}%`}
          subColor="var(--color-grass)"
        />
        <StatCard
          icon={<IconChart className="h-4 w-4 text-cream" />}
          iconBg="var(--color-bubblegum)"
          title="Semestre actual"
          value={user.currentSemester ? `${user.currentSemester}°` : "—"}
          sub={user.currentSemester ? "Actual" : "Defínelo en Ajustes"}
          subColor="var(--color-bubblegum)"
        />
        <StatCard
          icon={<IconBook className="h-4 w-4 text-cream" />}
          iconBg="var(--color-cobalt)"
          title="Materias totales"
          value={`${courses.length}`}
          sub={`${completedCount} aprobadas`}
          subColor="var(--color-cobalt)"
        />
        <StatCard
          icon={<IconCalendar className="h-4 w-4 text-ink" />}
          iconBg="var(--color-tangerine)"
          title="Materias restantes"
          value={`${remainingCount}`}
          sub={`${remainingCredits} créditos`}
          subColor="var(--color-tangerine)"
        />
        <StatCard
          icon={<Sparkle className="h-4 w-4 text-ink" />}
          iconBg="var(--color-cream)"
          title="Promedio general"
          value={generalAverage === null ? "—" : generalAverage.toFixed(1)}
          suffix={generalAverage === null ? undefined : `/ ${MAX_SCORE.toFixed(1)}`}
          sub={averageLabel}
          subColor="var(--color-ink)"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-4 rounded-3xl border-[3px] border-ink bg-cream p-6 shadow-hard">
          <h2 className="self-start font-display text-base font-bold text-ink">
            Progreso general
          </h2>
          <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="var(--color-paper-deep)"
              strokeWidth="16"
            />
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="var(--color-grass)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="-mt-[124px] flex flex-col items-center">
            <span className="font-display text-3xl font-bold text-ink">{pct}%</span>
            <span className="text-xs font-semibold text-ink/50">
              {completedCredits} / {TOTAL_CREDITS} créditos
            </span>
          </div>
          <div className="mt-8 w-full space-y-2">
            {legend.map((l) => (
              <div key={l.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-ink/80">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-ink"
                    style={{ background: l.color }}
                  />
                  {l.label}
                </span>
                <span className="font-display font-bold text-ink">{l.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border-[2.5px] border-ink bg-tangerine p-5 shadow-hard">
            <p className="font-display text-base font-bold text-ink">{message}</p>
          </div>
          <div className="rounded-3xl border-[2.5px] border-ink bg-cream p-5 shadow-hard">
            <h3 className="mb-3 font-display text-sm font-bold text-ink">
              Cómo se calcula el promedio general
            </h3>
            <p className="text-sm font-semibold text-ink/70">
              Es el promedio de la nota final de las materias que ya viste y que tienen
              el 100% de sus notas registradas en{" "}
              <span className="font-bold">Mis materias</span>. Si aún no has
              registrado notas, aquí verás &quot;Sin datos&quot;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
