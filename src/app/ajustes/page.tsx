"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { CAREERS } from "@/lib/types";
import { IconLogout } from "@/components/doodles";

export default function AjustesPage() {
  const { user, updateCurrentSemester, logout } = useApp();
  const [semester, setSemester] = useState(user.currentSemester ? String(user.currentSemester) : "");
  const [saved, setSaved] = useState(false);

  const career = CAREERS.find((c) => c.value === user.career)?.label ?? user.career;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const value = semester.trim() === "" ? null : Number(semester);
    await updateCurrentSemester(value);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
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
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
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
