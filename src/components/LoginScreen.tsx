"use client";

import { useState } from "react";

export default function LoginScreen({
  onLogin,
}: {
  onLogin: (username: string) => void;
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim().length < 2) {
      setError("Escribe al menos 2 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error de servidor");
      onLogin(data.user.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-4">
      <div className="w-full max-w-sm rounded-2xl border-2 border-slate-800 bg-white p-8 shadow-[6px_6px_0_0_rgba(30,41,59,1)]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-slate-800 bg-[#FFD966] text-2xl font-bold text-slate-900">
            π
          </div>
          <h1 className="text-xl font-bold text-slate-900">Mi Pensum</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingeniería Informática · Politécnico JIC
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Escribe tu nombre de usuario"
            className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border-2 border-slate-800 bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          No necesitas contraseña. Tu avance se guarda con este nombre.
        </p>
      </div>
    </div>
  );
}
