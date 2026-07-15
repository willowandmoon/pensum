"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/AppContext";
import {
  AREA_INFO,
  Course,
  getVisualStatus,
  Grade,
  MAX_SCORE,
  PASSING_SCORE,
  STATUS_INFO,
  Status,
  summarizeGrades,
} from "@/lib/types";
import { IconPlus, IconTrash } from "@/components/doodles";

export default function MateriasPage() {
  const { courses, statuses, lockedCodes, grades, addGrade, deleteGrade } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const grouped = useMemo(() => {
    const map = new Map<number, Course[]>();
    for (const c of filtered) {
      if (!map.has(c.level)) map.set(c.level, []);
      map.get(c.level)!.push(c);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const selectedCourse = selected ? courses.find((c) => c.code === selected) : null;
  const selectedGrades = useMemo(
    () => (selected ? grades.filter((g) => g.courseCode === selected) : []),
    [grades, selected]
  );

  return (
    <div className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-ink">Mis materias</h1>
        <p className="text-xs font-semibold text-ink/60">
          Elige una materia para llevar el registro de tus notas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex max-h-[75vh] flex-col rounded-3xl border-[2.5px] border-ink bg-cream shadow-hard">
          <div className="border-b-2 border-dashed border-ink/30 p-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar materia..."
              className="w-full rounded-xl border-2 border-ink bg-cream px-3 py-2 text-sm font-semibold text-ink placeholder-ink/40 outline-none focus:bg-white"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {grouped.map(([level, list]) => (
              <div key={level} className="mb-3">
                <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-ink/40">
                  Semestre {level}
                </p>
                <div className="space-y-1.5">
                  {list.map((course) => {
                    const status = statuses[course.code] ?? "pending";
                    const visual = getVisualStatus(status, lockedCodes.has(course.code));
                    const state = STATUS_INFO[visual];
                    const area = AREA_INFO[course.area];
                    const active = selected === course.code;
                    return (
                      <button
                        key={course.code}
                        onClick={() => setSelected(course.code)}
                        className={[
                          "flex w-full items-center gap-2 rounded-xl border-2 px-2.5 py-2 text-left transition",
                          active
                            ? "border-ink bg-cobalt text-cream shadow-hard-sm"
                            : "border-transparent hover:border-ink/30",
                        ].join(" ")}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink"
                          style={{ background: area.bg }}
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                          {course.name}
                        </span>
                        <span
                          className="shrink-0 rounded-full border border-ink px-1.5 py-0.5 text-[9px] font-bold"
                          style={{
                            background: active ? "var(--color-cream)" : state.bg,
                            color: active ? "var(--color-ink)" : state.text,
                          }}
                        >
                          {state.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {grouped.length === 0 && (
              <p className="px-2 py-4 text-sm font-semibold text-ink/40">
                No hay materias que coincidan con tu búsqueda.
              </p>
            )}
          </div>
        </div>

        <div>
          {selectedCourse ? (
            <CourseDetail
              course={selectedCourse}
              status={statuses[selectedCourse.code] ?? "pending"}
              locked={lockedCodes.has(selectedCourse.code)}
              grades={selectedGrades}
              onAddGrade={addGrade}
              onDeleteGrade={deleteGrade}
            />
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-3xl border-[2.5px] border-dashed border-ink/30 bg-cream/50 p-8 text-center">
              <p className="font-semibold text-ink/50">
                Selecciona una materia de la lista para ver y agregar tus notas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseDetail({
  course,
  status,
  locked,
  grades,
  onAddGrade,
  onDeleteGrade,
}: {
  course: Course;
  status: Status;
  locked: boolean;
  grades: Grade[];
  onAddGrade: (
    courseCode: string,
    description: string,
    score: number,
    weight: number
  ) => Promise<{ ok: boolean; error?: string }>;
  onDeleteGrade: (id: number) => Promise<void>;
}) {
  const area = AREA_INFO[course.area];
  const [description, setDescription] = useState("");
  const [score, setScore] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const summary = summarizeGrades(grades);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const scoreNum = Number(score);
    const weightNum = Number(weight);
    if (!description.trim()) {
      setError("Escribe de qué trata la nota.");
      return;
    }
    if (!Number.isFinite(scoreNum) || scoreNum < 0 || scoreNum > 5) {
      setError("La nota debe estar entre 0.0 y 5.0.");
      return;
    }
    if (!Number.isFinite(weightNum) || weightNum <= 0 || weightNum > 100) {
      setError("El porcentaje debe estar entre 1 y 100.");
      return;
    }
    setSaving(true);
    const res = await onAddGrade(course.code, description.trim(), scoreNum, weightNum);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Algo salió mal.");
      return;
    }
    setDescription("");
    setScore("");
    setWeight("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-3xl border-[2.5px] border-ink p-5 shadow-hard"
        style={{ background: area.bg, color: area.text }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg font-bold">{course.name}</p>
            <p className="text-xs font-bold opacity-80">
              {course.code} · {course.credits} créditos · Semestre {course.level} ·{" "}
              {area.label}
            </p>
          </div>
          <span
            className="rounded-full border-2 px-3 py-1 text-xs font-bold"
            style={{
              background: STATUS_INFO[getVisualStatus(status, locked)].bg,
              color: STATUS_INFO[getVisualStatus(status, locked)].text,
              borderColor: "var(--color-ink)",
            }}
          >
            {STATUS_INFO[getVisualStatus(status, locked)].label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryTile
          label="Llevas acumulado"
          value={`${summary.accumulated.toFixed(2)} / ${MAX_SCORE.toFixed(1)}`}
          sub={`${summary.weightEntered.toFixed(0)}% de la materia evaluado`}
        />
        {summary.isFinal ? (
          <SummaryTile
            label="Nota final"
            value={summary.accumulated.toFixed(2)}
            sub={summary.accumulated >= PASSING_SCORE ? "Aprobada" : "Reprobada"}
            tone={summary.accumulated >= PASSING_SCORE ? "good" : "bad"}
          />
        ) : summary.guaranteedPass ? (
          <SummaryTile
            label="Ya la pasaste"
            value="✓"
            sub={`Aunque saques 0 en el ${summary.weightRemaining.toFixed(0)}% restante, apruebas.`}
            tone="good"
          />
        ) : summary.impossibleToPass ? (
          <SummaryTile
            label="Ya no es posible pasarla"
            value="—"
            sub="Ni sacando 5.0 en lo que falta llegas a 3.0."
            tone="bad"
          />
        ) : summary.neededOnRemaining !== null ? (
          <SummaryTile
            label={`Necesitas en el ${summary.weightRemaining.toFixed(0)}% restante`}
            value={summary.neededOnRemaining.toFixed(2)}
            sub="Para llegar a 3.0 y pasar la materia"
          />
        ) : (
          <SummaryTile
            label="Aún sin notas"
            value="—"
            sub="Agrega tu primera nota para ver el cálculo."
          />
        )}
      </div>

      <div className="rounded-3xl border-[2.5px] border-ink bg-cream p-5 shadow-hard">
        <h3 className="mb-3 font-display text-sm font-bold text-ink">Notas registradas</h3>
        {grades.length === 0 ? (
          <p className="text-sm font-semibold text-ink/40">
            Todavía no has agregado notas de esta materia.
          </p>
        ) : (
          <div className="mb-4 space-y-2">
            {grades.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/20 bg-white px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{g.description}</p>
                  <p className="text-xs font-semibold text-ink/50">
                    {g.score.toFixed(1)} / 5.0 · vale {g.weight}%
                  </p>
                </div>
                <button
                  onClick={() => onDeleteGrade(g.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-ink/20 text-ink/50 transition hover:border-tomato hover:text-tomato"
                  aria-label="Eliminar nota"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_100px_100px_auto]">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿De qué trata? (ej. Parcial 1)"
            className="rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink placeholder-ink/40 outline-none"
          />
          <input
            value={score}
            onChange={(e) => setScore(e.target.value)}
            type="number"
            step="0.1"
            min="0"
            max="5"
            placeholder="Nota /5"
            className="rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink placeholder-ink/40 outline-none"
          />
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            placeholder="Vale % (ej. 12.5)"
            className="rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink placeholder-ink/40 outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-ink bg-grass px-3 py-2 text-sm font-bold text-cream shadow-hard-sm transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            <IconPlus className="h-4 w-4" />
            Agregar
          </button>
        </form>
        {error && (
          <p className="mt-2 rounded-xl border-2 border-tomato bg-tomato/10 px-3 py-2 text-sm font-semibold text-tomato">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "good" | "bad";
}) {
  const color =
    tone === "good" ? "var(--color-grass)" : tone === "bad" ? "var(--color-tomato)" : "var(--color-cobalt)";
  return (
    <div className="rounded-3xl border-[2.5px] border-ink bg-cream p-5 shadow-hard">
      <p className="text-xs font-bold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-ink/60">{sub}</p>
    </div>
  );
}
