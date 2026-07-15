"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import LoginScreen from "@/components/LoginScreen";
import Sidebar from "@/components/Sidebar";
import {
  AREA_ORDER,
  Course,
  Grade,
  ScheduleBlock,
  Status,
  TOTAL_CREDITS,
  User,
} from "@/lib/types";

const STORAGE_KEY = "pensum-user";

interface AppContextValue {
  user: User;
  courses: Course[];
  statuses: Record<string, Status>;
  grades: Grade[];
  scheduleBlocks: ScheduleBlock[];
  courseByCode: Map<string, Course>;
  coursesByLevel: Map<number, Course[]>;
  creditsByLevel: Map<number, { count: number; credits: number }>;
  lockedCodes: Set<string>;
  completedCredits: number;
  currentCredits: number;
  currentCount: number;
  pct: number;
  cycleStatus: (code: string, next: Status) => boolean;
  addGrade: (
    courseCode: string,
    description: string,
    score: number,
    weight: number
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteGrade: (id: number) => Promise<void>;
  addScheduleBlock: (
    courseCode: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteScheduleBlock: (id: number) => Promise<void>;
  updateCurrentSemester: (semester: number | null) => Promise<void>;
  updateBaselineAverages: (
    semesterAverage: number | null,
    cumulativeAverage: number | null
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [grades, setGrades] = useState<Grade[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const pendingSaves = useRef<Record<string, Promise<unknown>>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setBootstrapped(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/pensum?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses ?? []);
        setStatuses(data.statuses ?? {});
      });
    fetch(`/api/grades?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => setGrades(data.grades ?? []));
    fetch(`/api/schedule?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => setScheduleBlocks(data.blocks ?? []));
  }, [user]);

  const courseByCode = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of courses) map.set(c.code, c);
    return map;
  }, [courses]);

  const coursesByLevel = useMemo(() => {
    const map = new Map<number, Course[]>();
    for (const c of courses) {
      if (!map.has(c.level)) map.set(c.level, []);
      map.get(c.level)!.push(c);
    }
    for (const list of map.values()) {
      list.sort((a, b) => AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area));
    }
    return map;
  }, [courses]);

  const creditsByLevel = useMemo(() => {
    const map = new Map<number, { count: number; credits: number }>();
    for (const c of courses) {
      const entry = map.get(c.level) ?? { count: 0, credits: 0 };
      entry.count += 1;
      entry.credits += c.credits;
      map.set(c.level, entry);
    }
    return map;
  }, [courses]);

  // Una materia está bloqueada si aún no has visto TODOS sus prerrequisitos.
  const lockedCodes = useMemo(() => {
    const locked = new Set<string>();
    for (const c of courses) {
      if (c.prereqs.length === 0) continue;
      const allDone = c.prereqs.every((code) => statuses[code] === "completed");
      if (!allDone) locked.add(c.code);
    }
    return locked;
  }, [courses, statuses]);

  const completedCredits = useMemo(
    () =>
      courses
        .filter((c) => statuses[c.code] === "completed")
        .reduce((sum, c) => sum + c.credits, 0),
    [courses, statuses]
  );

  const currentCredits = useMemo(
    () =>
      courses
        .filter((c) => statuses[c.code] === "current")
        .reduce((sum, c) => sum + c.credits, 0),
    [courses, statuses]
  );

  const currentCount = useMemo(
    () => Object.values(statuses).filter((s) => s === "current").length,
    [statuses]
  );

  const pct = Math.min(100, Math.round((completedCredits / TOTAL_CREDITS) * 100));

  function handleAuthenticated(nextUser: User) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setCourses([]);
    setStatuses({});
    setGrades([]);
    setScheduleBlocks([]);
  }

  const cycleStatus = useCallback(
    (code: string, next: Status): boolean => {
      if (!user) return false;
      if (next !== "pending" && lockedCodes.has(code)) return false;

      setStatuses((prev) => {
        const copy = { ...prev };
        if (next === "pending") delete copy[code];
        else copy[code] = next;
        return copy;
      });

      const email = user.email;
      const previous = pendingSaves.current[code] ?? Promise.resolve();
      pendingSaves.current[code] = previous.then(() =>
        fetch("/api/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, courseCode: code, status: next }),
        }).catch(() => {})
      );
      return true;
    },
    [user, lockedCodes]
  );

  const addGrade = useCallback(
    async (courseCode: string, description: string, score: number, weight: number) => {
      if (!user) return { ok: false, error: "No hay sesión activa." };
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, courseCode, description, score, weight }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Error de servidor." };
      setGrades((prev) => [...prev, data.grade]);
      return { ok: true };
    },
    [user]
  );

  const deleteGrade = useCallback(
    async (id: number) => {
      if (!user) return;
      setGrades((prev) => prev.filter((g) => g.id !== id));
      await fetch(`/api/grades?email=${encodeURIComponent(user.email)}&id=${id}`, {
        method: "DELETE",
      }).catch(() => {});
    },
    [user]
  );

  const addScheduleBlock = useCallback(
    async (courseCode: string, dayOfWeek: number, startTime: string, endTime: string) => {
      if (!user) return { ok: false, error: "No hay sesión activa." };
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, courseCode, dayOfWeek, startTime, endTime }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Error de servidor." };
      setScheduleBlocks((prev) => [...prev, data.block]);
      return { ok: true };
    },
    [user]
  );

  const deleteScheduleBlock = useCallback(
    async (id: number) => {
      if (!user) return;
      setScheduleBlocks((prev) => prev.filter((b) => b.id !== id));
      await fetch(`/api/schedule?email=${encodeURIComponent(user.email)}&id=${id}`, {
        method: "DELETE",
      }).catch(() => {});
    },
    [user]
  );

  const updateCurrentSemester = useCallback(
    async (semester: number | null) => {
      if (!user) return;
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, currentSemester: semester }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      }
    },
    [user]
  );

  const updateBaselineAverages = useCallback(
    async (semesterAverage: number | null, cumulativeAverage: number | null) => {
      if (!user) return { ok: false, error: "No hay sesión activa." };
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          baselineSemesterAverage: semesterAverage,
          baselineAverage: cumulativeAverage,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Error de servidor." };
      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      return { ok: true };
    },
    [user]
  );

  if (!bootstrapped) return null;

  if (!user) {
    return <LoginScreen onAuthenticated={handleAuthenticated} />;
  }

  const value: AppContextValue = {
    user,
    courses,
    statuses,
    grades,
    scheduleBlocks,
    courseByCode,
    coursesByLevel,
    creditsByLevel,
    lockedCodes,
    completedCredits,
    currentCredits,
    currentCount,
    pct,
    cycleStatus,
    addGrade,
    deleteGrade,
    addScheduleBlock,
    deleteScheduleBlock,
    updateCurrentSemester,
    updateBaselineAverages,
    logout,
  };

  return (
    <AppContext.Provider value={value}>
      <div className="relative min-h-screen lg:flex">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </AppContext.Provider>
  );
}
