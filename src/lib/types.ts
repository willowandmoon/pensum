export type Area = "B" | "C" | "L" | "O" | "P" | "T";

export type Status = "pending" | "current" | "completed";

export interface Course {
  code: string;
  name: string;
  level: number;
  credits: number;
  area: Area;
  prereqs: string[];
}

export const AREA_INFO: Record<Area, { label: string; dot: string }> = {
  B: { label: "Ciencias Básicas", dot: "#eab308" },
  C: { label: "Disciplinar Profesional", dot: "#14b8a6" },
  L: { label: "Electiva Libre", dot: "#a855f7" },
  O: { label: "Profundización", dot: "#f97316" },
  P: { label: "Trabajo de Grado", dot: "#f43f5e" },
  T: { label: "Obligatoria de Ley", dot: "#64748b" },
};

export const TOTAL_CREDITS = 166;
