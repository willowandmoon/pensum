"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LoginScreen from "./LoginScreen";
import CourseCard from "./CourseCard";
import PrereqLines from "./PrereqLines";
import { Confetti, Loop, Sparkle, Star } from "./doodles";
import {
  AREA_INFO,
  AREA_ORDER,
  COURSE_ROW,
  Course,
  MAX_ROW,
  Status,
  TOTAL_CREDITS,
  User,
} from "@/lib/types";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const STORAGE_KEY = "pensum-user";

const SEMESTER_COLORS = [
  "var(--color-tomato)",
  "var(--color-cobalt)",
  "var(--color-grass)",
  "var(--color-tangerine)",
  "var(--color-bubblegum)",
];

export default function PensumApp() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  // Materia que el usuario intentó marcar estando bloqueada (para animar rechazo).
  const [deniedCode, setDeniedCode] = useState<string | null>(null);
  // Vista malla (diagrama con líneas) en pantallas anchas; vista apilada en móvil.
  const [isWide, setIsWide] = useState(true);
  // La malla se escala para caber completa (ancho + alto) en el área disponible.
  const [fitScale, setFitScale] = useState(1);
  const [availH, setAvailH] = useState(0);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  // Zoom manual del usuario sobre el ajuste base (1 = ajustado a pantalla).
  const [zoom, setZoom] = useState(1);
  const scale = fitScale * zoom;

  const fitRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  // Encadena los guardados por materia para que no se crucen en el servidor
  // si el usuario cambia el estado de una misma materia varias veces seguido.
  const pendingSaves = useRef<Record<string, Promise<unknown>>>({});
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Escala la malla para que quepa completa (ancho + alto) en el área disponible.
  useEffect(() => {
    if (!isWide) return;
    function fit() {
      const wrap = fitRef.current;
      const board = boardRef.current;
      if (!wrap || !board) return;
      const nw = board.scrollWidth;
      const nh = board.scrollHeight;
      if (!nw) return;
      const availW = wrap.clientWidth;
      const top = wrap.getBoundingClientRect().top;
      // Reserva para el padding del panel/main debajo del board y un respiro.
      const availableHeight = Math.max(280, window.innerHeight - top - 56);
      const s = Math.min(1, availW / nw, availableHeight / nh);
      setNatural({ w: nw, h: nh });
      setFitScale(s);
      setAvailH(availableHeight);
    }
    fit();
    const ro = new ResizeObserver(fit);
    if (fitRef.current) ro.observe(fitRef.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [isWide, courses, loading]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/pensum?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses);
        setStatuses(data.statuses);
      })
      .finally(() => setLoading(false));
  }, [user]);

  function handleAuthenticated(nextUser: User) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setCourses([]);
    setStatuses({});
  }

  function cycleStatus(code: string, next: Status) {
    if (!user) return;
    // Bloqueada: no se puede marcar como "este semestre" ni "vista" hasta
    // ver todos los prerrequisitos. Sí se permite volver a "pendiente".
    if (next !== "pending" && lockedCodes.has(code)) {
      setDeniedCode(code);
      window.setTimeout(() => setDeniedCode(null), 500);
      return;
    }
    setStatuses((prev) => {
      const copy = { ...prev };
      if (next === "pending") delete copy[code];
      else copy[code] = next;
      return copy;
    });
    const email = user.email;
    const previous = pendingSaves.current[code] ?? Promise.resolve();
    pendingSaves.current[code] = previous.then(() =>
      fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, courseCode: code, status: next }),
      }).catch(() => {})
    );
  }

  const creditsByLevel = useMemo(() => {
    const map = new Map<number, { count: number; credits: number }>();
    for (const c of courses) {
      const entry = map.get(c.level) ?? { count: 0, credits: 0 };
      entry.count += 1;
      entry.credits += c.credits;
      map.set(c.level, entry);
    }
    return map;
  }, [courses]);

  const coursesByLevel = useMemo(() => {
    const map = new Map<number, Course[]>();
    for (const c of courses) {
      if (!map.has(c.level)) map.set(c.level, []);
      map.get(c.level)!.push(c);
    }
    for (const list of map.values()) {
      list.sort((a, b) => AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area));
    }
    return map;
  }, [courses]);

  const courseByCode = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of courses) map.set(c.code, c);
    return map;
  }, [courses]);

  // Una materia está bloqueada si aún no has visto TODOS sus prerrequisitos.
  // (Los correquisitos pueden cursarse el mismo semestre, así que no bloquean.)
  const lockedCodes = useMemo(() => {
    const locked = new Set<string>();
    for (const c of courses) {
      if (c.prereqs.length === 0) continue;
      const allDone = c.prereqs.every((code) => statuses[code] === "completed");
      if (!allDone) locked.add(c.code);
    }
    return locked;
  }, [courses, statuses]);

  const relatedToHover = useMemo(() => {
    if (!hoveredCode) return null;
    const related = new Set<string>([hoveredCode]);
    const hovered = courseByCode.get(hoveredCode);
    if (hovered) {
      for (const p of [...hovered.prereqs, ...hovered.coreqs]) related.add(p);
    }
    for (const c of courses) {
      if (c.prereqs.includes(hoveredCode) || c.coreqs.includes(hoveredCode)) {
        related.add(c.code);
      }
    }
    return related;
  }, [hoveredCode, courseByCode, courses]);

  const completedCredits = useMemo(
    () =>
      courses
        .filter((c) => statuses[c.code] === "completed")
        .reduce((sum, c) => sum + c.credits, 0),
    [courses, statuses]
  );

  const currentCredits = useMemo(
    () =>
      courses
        .filter((c) => statuses[c.code] === "current")
        .reduce((sum, c) => sum + c.credits, 0),
    [courses, statuses]
  );

  const currentCount = useMemo(
    () => Object.values(statuses).filter((s) => s === "current").length,
    [statuses]
  );

  const pct = Math.min(100, Math.round((completedCredits / TOTAL_CREDITS) * 100));
  const currentPct = Math.min(100 - pct, Math.round((currentCredits / TOTAL_CREDITS) * 100));

  if (!user) {
    return <LoginScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* doodles de margen: la decoración solo vive en los bordes de la página */}
      <Star className="pointer-events-none absolute left-3 top-24 hidden h-9 w-9 text-tangerine/60 lg:block" />
      <Sparkle className="pointer-events-none absolute right-4 top-16 hidden h-8 w-8 text-cobalt/60 lg:block" />
      <Loop className="pointer-events-none absolute -left-3 bottom-1/3 hidden h-14 w-20 text-grass/40 lg:block" />
      <Confetti className="pointer-events-none absolute right-3 bottom-1/4 hidden h-7 w-7 rotate-12 text-bubblegum/60 lg:block" />

      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b-[3px] border-ink bg-cream/95 shadow-hard-sm backdrop-blur">
          <div className="mx-auto flex max-w-[1700px] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink font-display text-lg font-bold shadow-hard-sm"
                  style={{ background: "var(--color-tangerine)", color: "var(--color-ink)" }}
                >
                  π
                </div>
                <div>
                  <h1 className="font-display text-lg font-bold leading-none text-ink">
                    Mi Pensum
                  </h1>
                  <p className="mt-1 text-xs font-bold text-ink/60">
                    Ingeniería Informática · Plan 8210
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border-2 border-ink bg-cream px-3 py-1.5 text-sm font-semibold text-ink shadow-hard-sm">
                  Hola, <span className="font-bold">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full border-2 border-ink bg-[color:var(--color-paper-deep)] px-3 py-1.5 text-sm font-bold text-ink shadow-hard-sm transition hover:-translate-y-0.5"
                >
                  Cambiar usuario
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              <div className="min-w-[240px] flex-1">
                <div className="mb-1 flex justify-between text-xs font-bold text-ink/70">
                  <span>
                    {completedCredits} / {TOTAL_CREDITS} créditos vistos
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="relative h-5 w-full overflow-hidden rounded-full border-2 border-ink bg-[color:var(--color-paper-deep)]">
                  <div
                    className="stripes absolute inset-y-0 left-0 rounded-full bg-grass transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    className="stripes-soft absolute inset-y-0 rounded-r-full border-l-2 border-dashed border-ink bg-tangerine/70 transition-all duration-500"
                    style={{ left: `${pct}%`, width: `${currentPct}%` }}
                  />
                </div>
              </div>
              <span className="rounded-full border-2 border-ink bg-tangerine px-3 py-1 text-xs font-bold text-ink shadow-hard-sm">
                {currentCount} materia{currentCount === 1 ? "" : "s"} este semestre
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {AREA_ORDER.map((key, i) => {
                  const info = AREA_INFO[key];
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-1 text-[11px] font-bold shadow-hard-sm"
                      style={{
                        background: info.bg,
                        color: info.text,
                        transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full border border-ink"
                        style={{ background: info.text }}
                      />
                      {info.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          {loading ? (
            <p className="font-semibold text-ink/60">Cargando tu pensum...</p>
          ) : isWide ? (
            <div className="rounded-3xl border-[3px] border-ink bg-cream p-3 shadow-hard sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-ink/30 px-1 pb-3">
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-ink/70">
                  <span className="flex items-center gap-1.5">
                    <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="var(--color-ink)" strokeWidth="2" strokeOpacity="0.4" /></svg>
                    Prerrequisito
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="var(--color-ink)" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="3 5" /></svg>
                    Correquisito
                  </span>
                  <span className="hidden text-ink/50 sm:inline">
                    · pasa el cursor sobre una materia para iluminar sus conexiones
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-full border-2 border-ink bg-[color:var(--color-paper-deep)] p-0.5 shadow-hard-sm">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, +(z / 1.2).toFixed(3)))}
                    className="flex h-7 w-7 items-center justify-center rounded-full font-bold text-ink transition hover:bg-cream"
                    aria-label="Alejar"
                  >
                    −
                  </button>
                  <span className="min-w-[3.2rem] text-center text-xs font-bold tabular-nums text-ink">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3, +(z * 1.2).toFixed(3)))}
                    className="flex h-7 w-7 items-center justify-center rounded-full font-bold text-ink transition hover:bg-cream"
                    aria-label="Acercar"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="ml-0.5 rounded-full px-2.5 py-1 text-xs font-bold text-ink transition hover:bg-cream"
                  >
                    Ajustar
                  </button>
                </div>
              </div>
              <div
                ref={fitRef}
                className="w-full overflow-auto rounded-2xl"
                style={{ maxHeight: availH || undefined }}
              >
                <div
                  style={{
                    height: natural.h * scale,
                    width: natural.w * scale,
                    margin: "0 auto",
                  }}
                >
                  <div
                    ref={boardRef}
                    className="relative grid w-max"
                    style={{
                      gridTemplateColumns: "repeat(10, 200px)",
                      gridTemplateRows: `auto repeat(${MAX_ROW}, 88px) auto`,
                      columnGap: 64,
                      rowGap: 24,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {ROMAN.map((label, i) => (
                      <div
                        key={`head-${i}`}
                        style={{ gridColumn: i + 1, gridRow: 1 }}
                        className="mb-1 flex justify-center"
                      >
                        <span
                          className="flex h-9 w-16 items-center justify-center rounded-full border-2 border-ink font-display text-sm font-bold shadow-hard-sm"
                          style={{
                            background: SEMESTER_COLORS[i % SEMESTER_COLORS.length],
                            color: "var(--color-cream)",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}

                    {courses.map((course, i) => {
                      const row = COURSE_ROW[course.code] ?? MAX_ROW;
                      return (
                        <div
                          key={course.code}
                          style={{ gridColumn: course.level, gridRow: row + 1 }}
                          className="h-full"
                        >
                          <CourseCard
                            course={course}
                            status={statuses[course.code] ?? "pending"}
                            locked={lockedCodes.has(course.code)}
                            denied={deniedCode === course.code}
                            index={i}
                            dimmed={relatedToHover !== null && !relatedToHover.has(course.code)}
                            highlighted={
                              relatedToHover !== null &&
                              relatedToHover.has(course.code) &&
                              course.code !== hoveredCode
                            }
                            onCycle={cycleStatus}
                            onHoverChange={setHoveredCode}
                            cardRef={(el) => {
                              if (el) cardRefs.current.set(course.code, el);
                              else cardRefs.current.delete(course.code);
                            }}
                          />
                        </div>
                      );
                    })}

                    {ROMAN.map((label, i) => {
                      const level = i + 1;
                      const info = creditsByLevel.get(level);
                      if (!info) return null;
                      return (
                        <div
                          key={`foot-${i}`}
                          style={{ gridColumn: level, gridRow: MAX_ROW + 2 }}
                          className="pt-3 text-center text-[11px] font-bold text-ink/40"
                        >
                          {info.count} ({info.credits} Cr)
                        </div>
                      );
                    })}

                    <PrereqLines
                      courses={courses}
                      statuses={statuses}
                      boardRef={boardRef}
                      cardRefs={cardRefs}
                      hoveredCode={hoveredCode}
                      scale={scale}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {ROMAN.map((label, i) => {
                const level = i + 1;
                const levelCourses = coursesByLevel.get(level) ?? [];
                const info = creditsByLevel.get(level);
                return (
                  <section
                    key={`sem-${level}`}
                    className="rounded-3xl border-[2.5px] border-ink bg-cream p-4 shadow-hard"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-ink px-2 font-display text-sm font-bold shadow-hard-sm"
                        style={{
                          background: SEMESTER_COLORS[i % SEMESTER_COLORS.length],
                          color: "var(--color-cream)",
                        }}
                      >
                        {label}
                      </span>
                      <span className="font-display text-sm font-bold text-ink">
                        Semestre {level}
                      </span>
                      {info && (
                        <span className="text-xs font-semibold text-ink/50">
                          · {info.count} materias · {info.credits} Cr
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {levelCourses.map((course, idx) => (
                        <CourseCard
                          key={course.code}
                          course={course}
                          status={statuses[course.code] ?? "pending"}
                          locked={lockedCodes.has(course.code)}
                          denied={deniedCode === course.code}
                          index={idx}
                          dimmed={false}
                          highlighted={false}
                          onCycle={cycleStatus}
                          onHoverChange={() => {}}
                          cardRef={() => {}}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
