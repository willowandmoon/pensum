"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CourseCard from "./CourseCard";
import PrereqLines from "./PrereqLines";
import { useApp } from "@/lib/AppContext";
import { COURSE_ROW, MAX_ROW } from "@/lib/types";
import StickerPicker from "./StickerPicker";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const SEMESTER_COLORS = [
  "var(--color-tomato)",
  "var(--color-cobalt)",
  "var(--color-grass)",
  "var(--color-tangerine)",
  "var(--color-bubblegum)",
];

export default function PensumApp() {
  const {
    user,
    courses,
    statuses,
    stickers,
    lockedCodes,
    coursesByLevel,
    creditsByLevel,
    cycleStatus,
    setSticker,
  } = useApp();

  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  // Materia que el usuario intentó marcar estando bloqueada (para animar rechazo).
  const [deniedCode, setDeniedCode] = useState<string | null>(null);
  // Materia para la que se está eligiendo un sticker (abre el selector modal).
  const [stickerPickerCode, setStickerPickerCode] = useState<string | null>(null);
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
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

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
  }, [isWide, courses]);

  function handleCycle(code: string, next: "pending" | "current" | "completed") {
    const applied = cycleStatus(code, next);
    if (!applied) {
      setDeniedCode(code);
      window.setTimeout(() => setDeniedCode(null), 500);
    }
  }

  const courseByCode = useMemo(() => {
    const map = new Map<string, (typeof courses)[number]>();
    for (const c of courses) map.set(c.code, c);
    return map;
  }, [courses]);

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

  if (courses.length === 0) {
    return <p className="p-6 font-semibold text-ink/60">Cargando tu pensum...</p>;
  }

  const stickerPickerCourse = stickerPickerCode ? courseByCode.get(stickerPickerCode) : null;

  return (
    <>
      {stickerPickerCourse && (
        <StickerPicker
          courseName={stickerPickerCourse.name}
          packId={user.stickerPack}
          current={stickers[stickerPickerCourse.code] ?? null}
          onSelect={(stickerId) => {
            setSticker(stickerPickerCourse.code, stickerId);
            setStickerPickerCode(null);
          }}
          onClose={() => setStickerPickerCode(null)}
        />
      )}
      {isWide ? (
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
                    sticker={stickers[course.code] ?? null}
                    dimmed={relatedToHover !== null && !relatedToHover.has(course.code)}
                    highlighted={
                      relatedToHover !== null &&
                      relatedToHover.has(course.code) &&
                      course.code !== hoveredCode
                    }
                    onCycle={handleCycle}
                    onHoverChange={setHoveredCode}
                    onOpenStickerPicker={setStickerPickerCode}
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
                  sticker={stickers[course.code] ?? null}
                  dimmed={false}
                  highlighted={false}
                  onCycle={handleCycle}
                  onHoverChange={() => {}}
                  onOpenStickerPicker={setStickerPickerCode}
                  cardRef={() => {}}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
      )}
    </>
  );
}

