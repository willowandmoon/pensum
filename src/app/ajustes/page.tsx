"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { CAREERS, DEFAULT_STICKER_PACK, STICKER_PACKS } from "@/lib/types";
import { IconLogout } from "@/components/doodles";

export default function AjustesPage() {
  const { user, courses, updateCurrentSemester, updateBaselineAverages, updateStickerPack, logout } =
    useApp();
  const numLevels = courses.length ? Math.max(...courses.map((c) => c.level)) : 10;
  const [semester, setSemester] = useState(user.currentSemester ? String(user.currentSemester) : "");
  const [saved, setSaved] = useState(false);
  const activePack = user.stickerPack || DEFAULT_STICKER_PACK;
  const [packSaving, setPackSaving] = useState<string | null>(null);

  async function handleSelectPack(packId: string) {
    if (packId === activePack || packSaving) return;
    setPackSaving(packId);
    await updateStickerPack(packId);
    setPackSaving(null);
  }

  // typeof (no !== null): sesiones con datos viejos en localStorage pueden
  // no tener estos campos (undefined) en vez de null.
  const hasBaseline = typeof user.baselineCredits === "number";
  const [semesterAvg, setSemesterAvg] = useState(
    typeof user.baselineSemesterAverage === "number" ? String(user.baselineSemesterAverage) : ""
  );
  const [cumulativeAvg, setCumulativeAvg] = useState(
    typeof user.baselineAverage === "number" ? String(user.baselineAverage) : ""
  );
  const [baselineError, setBaselineError] = useState<string | null>(null);
  const [baselineSaved, setBaselineSaved] = useState(false);

  const career = CAREERS.find((c) => c.value === user.career)?.label ?? user.career;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const value = semester.trim() === "" ? null : Number(semester);
    await updateCurrentSemester(value);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function handleSaveBaseline(e: React.FormEvent) {
    e.preventDefault();
    setBaselineError(null);
    const sem = semesterAvg.trim() === "" ? null : Number(semesterAvg);
    const cum = cumulativeAvg.trim() === "" ? null : Number(cumulativeAvg);
    if (sem !== null && (Number.isNaN(sem) || sem < 0 || sem > 5)) {
      setBaselineError("El promedio semestral debe estar entre 0.0 y 5.0.");
      return;
    }
    if (cum !== null && (Number.isNaN(cum) || cum < 0 || cum > 5)) {
      setBaselineError("El promedio acumulado debe estar entre 0.0 y 5.0.");
      return;
    }
    const res = await updateBaselineAverages(sem, cum);
    if (!res.ok) {
      setBaselineError(res.error ?? "Algo salió mal.");
      return;
    }
    setBaselineSaved(true);
    window.setTimeout(() => setBaselineSaved(false), 1800);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-ink">Ajustes</h1>
        <p className="text-xs font-semibold text-ink/60">Tu cuenta y preferencias.</p>
      </div>

      <div className="mb-4 rounded-3xl border-[2.5px] border-ink bg-cream p-5 shadow-hard">
        <h2 className="mb-3 font-display text-sm font-bold text-ink">Tu cuenta</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="font-semibold text-ink/50">Nombre</dt>
            <dd className="font-bold text-ink">{user.name}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-semibold text-ink/50">Correo</dt>
            <dd className="font-bold text-ink">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-semibold text-ink/50">Carrera</dt>
            <dd className="font-bold text-ink">{career}</dd>
          </div>
        </dl>
      </div>

      <div className="mb-4 rounded-3xl border-[2.5px] border-ink bg-cream p-5 shadow-hard">
        <h2 className="mb-1 font-display text-sm font-bold text-ink">Semestre actual</h2>
        <p className="mb-3 text-xs font-semibold text-ink/50">
          Indícalo manualmente; se usa en la página de Estadísticas.
        </p>
        <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2">
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink outline-none"
          >
            <option value="">Sin definir</option>
            {Array.from({ length: numLevels }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Semestre {n}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl border-2 border-ink bg-cobalt px-4 py-2 text-sm font-bold text-cream shadow-hard-sm transition hover:-translate-y-0.5"
          >
            Guardar
          </button>
          {saved && (
            <span className="text-sm font-bold text-grass">Guardado.</span>
          )}
        </form>
      </div>

      <div className="mb-4 rounded-3xl border-[2.5px] border-ink bg-cream p-5 shadow-hard">
        <h2 className="mb-1 font-display text-sm font-bold text-ink">Pack de stickers</h2>
        <p className="mb-3 text-xs font-semibold text-ink/50">
          Elige qué stickers puedes pegar en las materias que ya viste.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {STICKER_PACKS.map((pack) => {
            const isActive = pack.id === activePack;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => handleSelectPack(pack.id)}
                disabled={packSaving !== null}
                className={[
                  "rounded-2xl border-2 p-3 text-left transition",
                  isActive
                    ? "border-ink bg-[color:var(--color-paper-deep)] shadow-hard-sm"
                    : "border-ink/20 hover:-translate-y-0.5 hover:border-ink",
                ].join(" ")}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-bold text-ink">{pack.label}</span>
                  {isActive && (
                    <span className="rounded-full border-2 border-ink bg-grass px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-cream">
                      Activo
                    </span>
                  )}
                  {!isActive && packSaving === pack.id && (
                    <span className="text-[10px] font-bold text-ink/40">Guardando...</span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {pack.stickers.slice(0, 5).map((s) => (
                    <img
                      key={s.id}
                      src={s.src}
                      alt={s.label}
                      className="h-9 w-9 object-contain"
                      draggable={false}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 rounded-3xl border-[2.5px] border-ink bg-cream p-5 shadow-hard">
        <h2 className="mb-1 font-display text-sm font-bold text-ink">Promedio de partida</h2>
        <p className="mb-3 text-xs font-semibold text-ink/50">
          {hasBaseline
            ? "Este es tu punto de partida. A partir de aquí, la app combina esto con las notas nuevas que registres en Mis materias para recalcular tu promedio sola."
            : "Cuéntanos el promedio que ya traes de semestres anteriores (una sola vez). Desde ese momento, la app lo combina con las notas nuevas que registres en Mis materias para recalcular todo automáticamente."}
        </p>
        <form onSubmit={handleSaveBaseline} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">
              Semestral
            </label>
            <input
              value={semesterAvg}
              onChange={(e) => setSemesterAvg(e.target.value)}
              type="number"
              step="0.01"
              min="0"
              max="5"
              placeholder="3.9"
              className="w-28 rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">
              Acumulado
            </label>
            <input
              value={cumulativeAvg}
              onChange={(e) => setCumulativeAvg(e.target.value)}
              type="number"
              step="0.01"
              min="0"
              max="5"
              placeholder="3.6"
              className="w-28 rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-semibold text-ink outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border-2 border-ink bg-cobalt px-4 py-2 text-sm font-bold text-cream shadow-hard-sm transition hover:-translate-y-0.5"
          >
            Guardar
          </button>
          {baselineSaved && <span className="text-sm font-bold text-grass">Guardado.</span>}
        </form>
        {baselineError && (
          <p className="mt-2 rounded-xl border-2 border-tomato bg-tomato/10 px-3 py-2 text-sm font-semibold text-tomato">
            {baselineError}
          </p>
        )}
        {hasBaseline && (
          <p className="mt-2 text-xs font-semibold text-ink/40">
            Punto de partida capturado con {user.baselineCredits} créditos ya vistos.
          </p>
        )}
      </div>

      <div className="rounded-3xl border-[2.5px] border-ink bg-cream p-5 shadow-hard">
        <h2 className="mb-3 font-display text-sm font-bold text-ink">Sesión</h2>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border-2 border-ink bg-[color:var(--color-paper-deep)] px-4 py-2 font-display text-sm font-bold text-ink shadow-hard-sm transition hover:-translate-y-0.5"
        >
          <IconLogout className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
