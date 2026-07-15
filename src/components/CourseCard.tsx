"use client";

import { AREA_INFO, Course, Status } from "@/lib/types";
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
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  // Bloqueada solo importa mientras siga pendiente (aún no la empezaste).
  const isBlocked = locked && !isCompleted && !isCurrent;
  const filled = isCompleted || isCurrent;
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
          "relative z-10 flex h-full w-full flex-col justify-between gap-1 rounded-2xl border-[2.5px] px-3 py-2.5 text-left",
          "transition-transform duration-200 outline-none",
          "hover:-translate-y-1 hover:rotate-0 focus-visible:-translate-y-1 focus-visible:rotate-0",
          highlighted || isCurrent ? "shadow-hard-lg -translate-y-1 rotate-0" : "shadow-hard",
          isBlocked ? "cursor-not-allowed border-dashed" : "",
          denied ? "animate-[shake_0.4s_ease-in-out]" : "",
        ].join(" ")}
        style={{
          background: filled ? area.bg : "var(--color-cream)",
          color: filled ? area.text : "var(--color-ink)",
          borderColor: denied ? "var(--color-tomato)" : "var(--color-ink)",
          filter: isBlocked ? "saturate(0.5)" : undefined,
        }}
      >
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
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 font-display text-[11px] font-bold"
            style={{
              borderColor: "var(--color-ink)",
              background: filled ? "var(--color-cream)" : area.bg,
              color: filled ? "var(--color-ink)" : area.text,
            }}
          >
            {course.credits}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1.5">
          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-cream px-2 py-0.5 font-sans text-[9px] font-extrabold uppercase tracking-wide text-ink">
              <Check className="h-2.5 w-2.5 text-grass" />
              Vista
            </span>
          )}
          {isCurrent && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-cream px-2 py-0.5 font-sans text-[9px] font-extrabold uppercase tracking-wide text-ink">
              <Sparkle className="h-2.5 w-2.5 text-tangerine" />
              Este semestre
            </span>
          )}
          {isBlocked && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-[color:var(--color-paper-deep)] px-2 py-0.5 font-sans text-[9px] font-extrabold uppercase tracking-wide text-ink">
              <Lock className="h-2.5 w-2.5 text-ink" />
              Bloqueada
            </span>
          )}
          {!isCompleted && !isCurrent && !isBlocked && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-grass px-2 py-0.5 font-sans text-[9px] font-extrabold uppercase tracking-wide text-cream">
              Disponible
            </span>
          )}
        </div>

        {isCurrent && (
          <Sparkle className="pointer-events-none absolute -right-2 -top-2 z-20 h-4 w-4 text-tangerine drop-shadow" />
        )}
      </button>
    </div>
  );
}
