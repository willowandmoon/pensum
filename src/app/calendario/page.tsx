"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { AREA_INFO, DAY_LABELS } from "@/lib/types";
import { IconPlus, IconTrash } from "@/components/doodles";

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 56;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function CalendarioPage() {
  const { courses, statuses, scheduleBlocks, addScheduleBlock, deleteScheduleBlock } = useApp();

  const currentCourses = useMemo(
    () => courses.filter((c) => statuses[c.code] === "current"),
    [courses, statuses]
  );

  const [courseCode, setCourseCode] = useState("");
  const [day, setDay] = useState(0);
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("09:00");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const courseByCode = useMemo(() => {
    const map = new Map<string, (typeof courses)[number]>();
    for (const c of courses) map.set(c.code, c);
    return map;
  }, [courses]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!courseCode) {
      setError("Elige una materia.");
      return;
    }
    if (start >= end) {
      setError("La hora de inicio debe ser antes que la de fin.");
      return;
    }
    setSaving(true);
    const res = await addScheduleBlock(courseCode, day, start, end);
    setSaving(false);
    if (!res.ok) setError(res.error ?? "Algo salió mal.");
  }

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const gridHeight = hours.length * HOUR_HEIGHT;

  return (
    <div className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-ink">Calendario</h1>
        <p className="text-xs font-semibold text-ink/60">
          El horario de las materias que estás cursando este semestre.
        </p>
      </div>

      <div className="mb-5 rounded-3xl border-[2.5px] border-ink bg-cream p-4 shadow-hard">
        {currentCourses.length === 0 ? (
          <p className="text-sm font-semibold text-ink/50">
            No tienes materias marcadas como &quot;cursando&quot; en el Pensum. Márcalas
            allá primero para poder agendarlas aquí.
          </p>
        ) : (
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_100px_100px_100px_auto]"
          >
            <select
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink outline-none"
            >
              <option value="">Elige una materia...</option>
              {currentCourses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink outline-none"
            >
              {DAY_LABELS.map((label, i) => (
                <option key={i} value={i}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink outline-none"
            />
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink outline-none"
            />
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-ink bg-grass px-3 py-2 text-sm font-bold text-cream shadow-hard-sm transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              <IconPlus className="h-4 w-4" />
              Agendar
            </button>
          </form>
        )}
        {error && (
          <p className="mt-2 rounded-xl border-2 border-tomato bg-tomato/10 px-3 py-2 text-sm font-semibold text-tomato">
            {error}
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-3xl border-[2.5px] border-ink bg-cream p-4 shadow-hard">
        <div className="flex min-w-[720px]">
          <div className="w-14 shrink-0 pt-8">
            {hours.map((h) => (
              <div
                key={h}
                style={{ height: HOUR_HEIGHT }}
                className="border-t border-ink/10 pr-2 text-right text-[11px] font-bold text-ink/40"
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          <div className="grid flex-1 grid-cols-6">
            {DAY_LABELS.map((label, dayIndex) => (
              <div key={label} className="relative border-l border-ink/10">
                <div className="flex h-8 items-center justify-center border-b-2 border-ink/20 font-display text-xs font-bold text-ink/60">
                  {label}
                </div>
                <div className="relative" style={{ height: gridHeight }}>
                  {hours.map((h) => (
                    <div
                      key={h}
                      style={{ height: HOUR_HEIGHT }}
                      className="border-t border-ink/10"
                    />
                  ))}
                  {scheduleBlocks
                    .filter((b) => b.dayOfWeek === dayIndex)
                    .map((b) => {
                      const course = courseByCode.get(b.courseCode);
                      const area = course ? AREA_INFO[course.area] : null;
                      const top =
                        ((timeToMinutes(b.startTime) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                      const height =
                        ((timeToMinutes(b.endTime) - timeToMinutes(b.startTime)) / 60) *
                        HOUR_HEIGHT;
                      return (
                        <div
                          key={b.id}
                          className="group absolute left-0.5 right-0.5 overflow-hidden rounded-lg border-2 border-ink px-1.5 py-1 shadow-hard-sm"
                          style={{
                            top,
                            height: Math.max(height, 24),
                            background: area?.bg ?? "var(--color-paper-deep)",
                            color: area?.text ?? "var(--color-ink)",
                          }}
                        >
                          <p className="truncate text-[10px] font-bold leading-tight">
                            {course?.name ?? b.courseCode}
                          </p>
                          <p className="truncate text-[9px] font-semibold opacity-80">
                            {b.startTime} - {b.endTime}
                          </p>
                          <button
                            onClick={() => deleteScheduleBlock(b.id)}
                            aria-label="Quitar del horario"
                            className="absolute right-0.5 top-0.5 hidden h-4 w-4 items-center justify-center rounded-full bg-cream text-ink group-hover:flex"
                          >
                            <IconTrash className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
