"use client";

import { useState } from "react";
import { CAREERS, User } from "@/lib/types";

type Mode = "login" | "register";

export default function LoginScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: User) => void;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [career, setCareer] = useState(CAREERS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && name.trim().length < 2) {
      setError("Escribe tu nombre completo.");
      return;
    }
    if (!email.includes("@")) {
      setError("Escribe un correo válido.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/register";
      const body =
        mode === "login"
          ? { email, password }
          : { name, email, password, career };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error de servidor");
      onAuthenticated(data.user);
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
          <p className="mt-1 text-sm text-slate-500">Politécnico JIC</p>
        </div>

        <div className="mb-5 flex rounded-lg border-2 border-slate-800 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${
              mode === "login" ? "bg-slate-900 text-white" : "text-slate-500"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${
              mode === "register" ? "bg-slate-900 text-white" : "text-slate-500"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800"
            />
          )}
          <input
            type="email"
            autoFocus={mode === "login"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800"
          />
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Carrera
              </label>
              <select
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-800"
              >
                {CAREERS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-400">
                Por ahora solo hay pensum cargado para esta carrera.
              </p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border-2 border-slate-800 bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {loading
              ? "Un momento..."
              : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
