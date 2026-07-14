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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_20%,#312e81,transparent_50%),radial-gradient(circle_at_80%_0%,#7c2d92,transparent_45%),#0b0b16] px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-bold text-white shadow-lg shadow-fuchsia-500/30">
            π
          </div>
          <h1 className="text-xl font-semibold text-white">Mi Pensum</h1>
          <p className="mt-1 text-sm text-white/60">
            Ingeniería Informática · Politécnico JIC
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Escribe tu nombre de usuario"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/30"
          />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-white/40">
          No necesitas contraseña. Tu avance se guarda con este nombre.
        </p>
      </div>
    </div>
  );
}
