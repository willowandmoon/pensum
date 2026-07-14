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
  onCycle,
}: {
  course: Course;
  status: Status;
  onCycle: (code: string, next: Status) => void;
}) {
  const area = AREA_INFO[course.area];
  const isCompleted = status === "completed";
  const isCurrent = status === "current";

  return (
    <button
      type="button"
      onClick={() => onCycle(course.code, NEXT_STATUS[status])}
      title="Clic para cambiar el estado"
      className={[
        "group relative w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
        isCurrent
          ? "border-fuchsia-400/70 bg-fuchsia-500/15 shadow-[0_0_0_1px_rgba(232,121,249,0.3),0_0_18px_rgba(232,121,249,0.25)]"
          : isCompleted
            ? "border-white/5 bg-white/[0.02] opacity-60"
            : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.08]",
      ].join(" ")}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: isCompleted ? "#3f3f46" : area.dot,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={[
            "text-[13px] font-medium leading-snug",
            isCompleted ? "text-white/40 line-through" : "text-white/90",
          ].join(" ")}
        >
          {course.name}
        </span>
        {isCompleted && (
          <svg
            viewBox="0 0 20 20"
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/40">
        <span>{course.credits} cr</span>
        <span className="h-1 w-1 rounded-full bg-white/20" />
        <span>{area.label}</span>
        {isCurrent && (
          <span className="ml-auto rounded-full bg-fuchsia-400/20 px-1.5 py-0.5 font-medium text-fuchsia-300">
            este semestre
          </span>
        )}
      </div>
    </button>
  );
}
