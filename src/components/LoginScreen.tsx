"use client";

import { useState } from "react";
import { CAREERS, User } from "@/lib/types";
import { Sparkle, Squiggle, Star } from "./doodles";
import Onboarding from "./Onboarding";

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
  // Tras registrarse (no al iniciar sesión), se muestra el onboarding antes
  // de entrar de lleno a la app.
  const [newUser, setNewUser] = useState<User | null>(null);

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
      if (mode === "register") {
        setNewUser(data.user);
      } else {
        onAuthenticated(data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setLoading(false);
    }
  }

  if (newUser) {
    return (
      <Onboarding name={newUser.name} onFinish={() => onAuthenticated(newUser)} />
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <Star className="pointer-events-none absolute left-8 top-16 h-9 w-9 text-tangerine/70" />
      <Sparkle className="pointer-events-none absolute right-10 top-24 h-8 w-8 text-cobalt/70" />
      <Sparkle className="pointer-events-none absolute bottom-20 left-14 h-7 w-7 text-bubblegum/70" />
      <Star className="pointer-events-none absolute bottom-16 right-12 h-8 w-8 text-grass/60" />

      <div className="w-full max-w-sm rounded-3xl border-[3px] border-ink bg-cream p-8 shadow-hard-lg">
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-[2.5px] border-ink font-display text-3xl font-bold shadow-hard-sm"
            style={{ background: "var(--color-tangerine)", color: "var(--color-ink)" }}
          >
            π
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Mi Pensum</h1>
          <Squiggle className="mx-auto mt-1 h-2.5 w-32 text-bubblegum" />
          <p className="mt-2 text-sm font-semibold text-ink/70">
            Lleva el control de tu carrera
          </p>
        </div>

        <div className="mb-5 flex rounded-full border-[2.5px] border-ink bg-[color:var(--color-paper-deep)] p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 rounded-full py-1.5 font-display text-sm font-semibold transition ${
              mode === "login" ? "border-2 border-ink bg-cobalt text-cream shadow-hard-sm" : "text-ink/60"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 rounded-full py-1.5 font-display text-sm font-semibold transition ${
              mode === "register" ? "border-2 border-ink bg-cobalt text-cream shadow-hard-sm" : "text-ink/60"
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
              className="w-full rounded-xl border-[2.5px] border-ink bg-cream px-4 py-3 font-semibold text-ink placeholder-ink/40 outline-none focus:bg-white"
            />
          )}
          <input
            type="email"
            autoFocus={mode === "login"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full rounded-xl border-[2.5px] border-ink bg-cream px-4 py-3 font-semibold text-ink placeholder-ink/40 outline-none focus:bg-white"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-xl border-[2.5px] border-ink bg-cream px-4 py-3 font-semibold text-ink placeholder-ink/40 outline-none focus:bg-white"
          />
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/60">
                Carrera
              </label>
              <select
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                className="w-full rounded-xl border-[2.5px] border-ink bg-cream px-4 py-3 font-semibold text-ink outline-none focus:bg-white"
              >
                {CAREERS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} — {c.institution}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs font-semibold text-ink/50">
                Universidad:{" "}
                <span className="font-bold text-ink/70">
                  {CAREERS.find((c) => c.value === career)?.institution}
                </span>
              </p>
            </div>
          )}
          {error && (
            <p className="rounded-xl border-2 border-tomato bg-tomato/10 px-3 py-2 text-sm font-semibold text-tomato">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full border-[2.5px] border-ink bg-grass py-3 font-display font-bold text-cream shadow-hard transition hover:-translate-y-0.5 hover:shadow-hard-lg disabled:opacity-50"
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
