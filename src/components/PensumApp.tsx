"use client";

import { useEffect, useMemo, useState } from "react";
import LoginScreen from "./LoginScreen";
import CourseCard from "./CourseCard";
import { AREA_INFO, Course, Status, TOTAL_CREDITS } from "@/lib/types";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const STORAGE_KEY = "pensum-username";

export default function PensumApp() {
  const [username, setUsername] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setUsername(saved);
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`/api/pensum?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses);
        setStatuses(data.statuses);
      })
      .finally(() => setLoading(false));
  }, [username]);

  function handleLogin(name: string) {
    localStorage.setItem(STORAGE_KEY, name);
    setUsername(name);
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setUsername(null);
    setCourses([]);
    setStatuses({});
  }

  function cycleStatus(code: string, next: Status) {
    if (!username) return;
    setStatuses((prev) => {
      const copy = { ...prev };
      if (next === "pending") delete copy[code];
      else copy[code] = next;
      return copy;
    });
    fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, courseCode: code, status: next }),
    }).catch(() => {});
  }

  const byLevel = useMemo(() => {
    const map = new Map<number, Course[]>();
    for (const c of courses) {
      if (!map.has(c.level)) map.set(c.level, []);
      map.get(c.level)!.push(c);
    }
    return map;
  }, [courses]);

  const completedCredits = useMemo(
    () =>
      courses
        .filter((c) => statuses[c.code] === "completed")
        .reduce((sum, c) => sum + c.credits, 0),
    [courses, statuses]
  );

  const currentCount = useMemo(
    () => Object.values(statuses).filter((s) => s === "current").length,
    [statuses]
  );

  const pct = Math.min(100, Math.round((completedCredits / TOTAL_CREDITS) * 100));

  if (!username) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0b16] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0b16]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Mi Pensum</h1>
              <p className="text-xs text-white/50">Ingeniería Informática · Plan 8210</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/70">
                Hola, <span className="font-medium text-white">{username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/60 transition hover:border-white/30 hover:text-white"
              >
                Cambiar usuario
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="min-w-[220px] flex-1">
              <div className="mb-1 flex justify-between text-xs text-white/50">
                <span>{completedCredits} / {TOTAL_CREDITS} créditos vistos</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span className="rounded-full bg-fuchsia-400/10 px-3 py-1 text-xs text-fuchsia-300">
              {currentCount} materia{currentCount === 1 ? "" : "s"} este semestre
            </span>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/50">
              {Object.entries(AREA_INFO).map(([key, info]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: info.dot }}
                  />
                  {info.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        {loading ? (
          <p className="text-white/50">Cargando tu pensum...</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {ROMAN.map((label, i) => {
              const level = i + 1;
              const levelCourses = byLevel.get(level) ?? [];
              const levelCredits = levelCourses.reduce((s, c) => s + c.credits, 0);
              return (
                <div key={level} className="w-[220px] flex-shrink-0">
                  <div className="mb-3 flex items-baseline justify-between px-1">
                    <span className="text-sm font-semibold text-white/80">
                      Semestre {label}
                    </span>
                    <span className="text-[11px] text-white/40">
                      {levelCredits} cr
                    </span>
                  </div>
                  <div className="space-y-2">
                    {levelCourses.map((course) => (
                      <CourseCard
                        key={course.code}
                        course={course}
                        status={statuses[course.code] ?? "pending"}
                        onCycle={cycleStatus}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
