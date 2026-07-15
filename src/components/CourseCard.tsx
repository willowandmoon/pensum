"use client";

import { AREA_INFO, Course, Status } from "@/lib/types";

const NEXT_STATUS: Record<Status, Status> = {
  pending: "current",
  current: "completed",
  completed: "pending",
};

export default function CourseCard({
  course,
  status,
  locked,
  denied = false,
  dimmed,
  highlighted,
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
  onCycle: (code: string, next: Status) => void;
  onHoverChange: (code: string | null) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}) {
  const area = AREA_INFO[course.area];
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  // Bloqueada solo importa mientras siga pendiente (aún no la empezaste).
  const isBlocked = locked && !isCompleted && !isCurrent;

  return (
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
        "group relative flex h-full w-full flex-col justify-between rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
        isCurrent
          ? "-translate-y-0.5 shadow-[0_6px_16px_-4px_rgba(30,41,59,0.28)] ring-2 ring-slate-900/80"
          : "shadow-[0_1px_2px_rgba(15,23,42,0.06),0_4px_12px_-6px_rgba(15,23,42,0.18)]",
        !isCompleted && !isBlocked
          ? "hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-8px_rgba(15,23,42,0.35)]"
          : "",
        isCompleted ? "opacity-70" : "",
        isBlocked ? "cursor-not-allowed border-dashed" : "",
        denied ? "animate-[shake_0.4s_ease-in-out]" : "",
        dimmed ? "opacity-30" : "",
        highlighted ? "ring-2 ring-offset-2 ring-slate-900/70" : "",
      ].join(" ")}
      style={{
        backgroundColor: isCompleted ? "#eef0f4" : area.bg,
        borderColor: isCurrent
          ? "#0f172a"
          : denied
            ? "#dc2626"
            : isCompleted
              ? "#d3d8e0"
              : area.border,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={[
            "text-[13px] font-semibold leading-snug",
            isCompleted ? "text-slate-400 line-through" : "",
          ].join(" ")}
          style={isCompleted ? undefined : { color: area.text }}
        >
          {course.name}
        </span>
        {isCompleted && (
          <svg
            viewBox="0 0 20 20"
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {isBlocked && (
          <svg
            viewBox="0 0 20 20"
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 opacity-50"
            style={{ color: area.text }}
            fill="currentColor"
          >
            <path d="M10 2a4 4 0 00-4 4v2H5a1 1 0 00-1 1v7a1 1 0 001 1h10a1 1 0 001-1v-7a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm-2 6V6a2 2 0 114 0v2H8z" />
          </svg>
        )}
      </div>
      <div
        className={[
          "mt-1.5 flex items-center gap-2 text-[11px]",
          isCompleted ? "text-slate-400" : "opacity-75",
        ].join(" ")}
        style={isCompleted ? undefined : { color: area.text }}
      >
        <span>{course.credits} cr</span>
        {isCurrent && (
          <span className="ml-auto rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            este semestre
          </span>
        )}
      </div>
    </button>
  );
}
