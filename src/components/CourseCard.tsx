"use client";

import { AREA_INFO, Course, getVisualStatus, STATUS_INFO, Status } from "@/lib/types";
import { Check, Lock, Sparkle } from "./doodles";

const NEXT_STATUS: Record<Status, Status> = {
  pending: "current",
  current: "completed",
  completed: "pending",
};

const TILT = ["tilt-1", "tilt-2", "tilt-3", "tilt-4"];

export default function CourseCard({
  course,
  status,
  locked,
  denied = false,
  dimmed,
  highlighted,
  index = 0,
  onCycle,
  onHoverChange,
  cardRef,
}: {
  course: Course;
  status: Status;
  locked: boolean;
  denied?: boolean;
  dimmed: boolean;
  highlighted: boolean;
  index?: number;
  onCycle: (code: string, next: Status) => void;
  onHoverChange: (code: string | null) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}) {
  const area = AREA_INFO[course.area];
  const visual = getVisualStatus(status, locked);
  const state = STATUS_INFO[visual];
  const isCompleted = visual === "completed";
  const isCurrent = visual === "current";
  const isBlocked = visual === "blocked";
  const tilt = TILT[index % TILT.length];

  return (
    <div
      className={[
        "group relative h-full transition-opacity duration-200",
        tilt,
        dimmed ? "opacity-30" : "opacity-100",
      ].join(" ")}
    >
      {/* cinta washi para materias ya vistas */}
      {isCompleted && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-2 z-20 h-5 w-12 rotate-[22deg]"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,.6) 0 5px, rgba(255,255,255,.3) 5px 10px)",
            border: "1px solid rgba(26,26,26,.4)",
            boxShadow: "1px 1px 0 rgba(26,26,26,.3)",
          }}
        />
      )}

      {/* anillo punteado para "este semestre" */}
      {isCurrent && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1.5 z-0 rounded-2xl border-2 border-dashed"
          style={{ borderColor: "var(--color-ink)" }}
        />
      )}

      {/* destello de esquina para "este semestre" (fuera del botón para no
          quedar recortado por el overflow-hidden de la franja de área) */}
      {isCurrent && (
        <Sparkle className="pointer-events-none absolute -right-2 -top-2 z-20 h-4 w-4 text-cobalt drop-shadow" />
      )}

      <button
        ref={cardRef}
        type="button"
        onClick={() => onCycle(course.code, NEXT_STATUS[status])}
        onMouseEnter={() => onHoverChange(course.code)}
        onMouseLeave={() => onHoverChange(null)}
        title={
          isBlocked
            ? "Bloqueada: primero debes ver su prerrequisito"
            : "Clic para cambiar el estado"
        }
        className={[
          "relative z-10 flex h-full w-full flex-col justify-between gap-1 overflow-hidden rounded-2xl border-[2.5px] py-2.5 pl-4 pr-3 text-left",
          "transition-transform duration-200 outline-none",
          "hover:-translate-y-1 hover:rotate-0 focus-visible:-translate-y-1 focus-visible:rotate-0",
          highlighted || isCurrent ? "shadow-hard-lg -translate-y-1 rotate-0" : "shadow-hard",
          isBlocked ? "cursor-not-allowed border-dashed" : "",
          denied ? "animate-[shake_0.4s_ease-in-out]" : "",
        ].join(" ")}
        style={{
          background: state.bg,
          color: state.text,
          borderColor: denied ? "var(--color-tomato)" : state.border,
        }}
      >
        {/* franja de color por área, bien visible en el borde izquierdo */}
        <span
          aria-hidden="true"
          title={area.label}
          className="absolute inset-y-0 left-0 w-2.5"
          style={{ background: area.bg, borderRight: "2px solid var(--color-ink)" }}
        />

        <div className="flex items-start justify-between gap-2">
          <span
            className={[
              "font-display text-[13px] font-semibold leading-snug",
              isCompleted ? "line-through opacity-70" : "",
            ].join(" ")}
          >
            {course.name}
          </span>
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-cream font-display text-[11px] font-bold text-ink"
          >
            {course.credits}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1.5">
          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-cream px-2 py-0.5 font-sans text-[9px] font-extrabold uppercase tracking-wide text-ink">
              <Check className="h-2.5 w-2.5 text-grass" />
              {state.label}
            </span>
          )}
          {isCurrent && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-cream px-2 py-0.5 font-sans text-[9px] font-extrabold uppercase tracking-wide text-ink">
              <Sparkle className="h-2.5 w-2.5 text-cobalt" />
              {state.label}
            </span>
          )}
          {isBlocked && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-cream px-2 py-0.5 font-sans text-[9px] font-extrabold uppercase tracking-wide text-ink">
              <Lock className="h-2.5 w-2.5 text-ink" />
              {state.label}
            </span>
          )}
          {!isCompleted && !isCurrent && !isBlocked && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-cream px-2 py-0.5 font-sans text-[9px] font-extrabold uppercase tracking-wide text-ink">
              {state.label}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
