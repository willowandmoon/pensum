export type Area = "CB" | "CBI" | "IA" | "FC" | "ESP";

export type Status = "pending" | "current" | "completed";

export interface Career {
  value: string;
  label: string;
}

// Por ahora solo hay pensum cargado para Ingeniería Informática.
// Cuando se agregue otra carrera, solo hay que sumarla aquí.
export const CAREERS: Career[] = [
  { value: "ing-informatica", label: "Ingeniería Informática" },
];

export interface User {
  email: string;
  name: string;
  career: string;
  currentSemester: number | null;
  // Punto de partida (se captura una sola vez en Ajustes): el promedio que
  // ya traía el estudiante antes de usar la app, junto con una "foto" de qué
  // materias/créditos tenía vistas en ese momento. Desde ahí la app combina
  // esta base con las notas nuevas para recalcular el promedio solo.
  baselineAverage: number | null;
  baselineSemesterAverage: number | null;
  baselineCredits: number | null;
  baselineCourseCodes: string[];
}

export interface Course {
  code: string;
  name: string;
  level: number;
  credits: number;
  area: Area;
  prereqs: string[];
  coreqs: string[];
}

export interface Grade {
  id: number;
  courseCode: string;
  description: string;
  score: number;
  weight: number;
}

export interface ScheduleBlock {
  id: number;
  courseCode: string;
  dayOfWeek: number; // 0 = lunes ... 5 = sábado
  startTime: string; // "07:00"
  endTime: string; // "09:00"
}

export const PASSING_SCORE = 3.0;
export const MAX_SCORE = 5.0;

export const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export interface GradeSummary {
  weightEntered: number;
  weightRemaining: number;
  weightedSum: number;
  currentAverage: number | null; // promedio de lo entregado hasta ahora (sobre 5.0)
  accumulated: number; // aporte a la nota final si el resto queda en 0 (sobre 5.0)
  neededOnRemaining: number | null; // lo que se necesita sacar en el % restante
  guaranteedPass: boolean;
  impossibleToPass: boolean;
  isFinal: boolean; // ya se entregó el 100% del porcentaje
}

export function summarizeGrades(grades: Grade[]): GradeSummary {
  const weightEntered = grades.reduce((s, g) => s + g.weight, 0);
  const weightedSum = grades.reduce((s, g) => s + g.score * g.weight, 0);
  const weightRemaining = Math.max(0, 100 - weightEntered);
  const currentAverage = weightEntered > 0 ? weightedSum / weightEntered : null;
  const accumulated = weightedSum / 100;
  const isFinal = weightRemaining <= 0.01;

  let neededOnRemaining: number | null = null;
  let guaranteedPass = accumulated >= PASSING_SCORE;
  let impossibleToPass = false;

  if (!isFinal) {
    const needed = (PASSING_SCORE * 100 - weightedSum) / weightRemaining;
    neededOnRemaining = needed;
    if (needed <= 0) guaranteedPass = true;
    else if (needed > MAX_SCORE) impossibleToPass = true;
  }

  return {
    weightEntered,
    weightRemaining,
    weightedSum,
    currentAverage,
    accumulated,
    neededOnRemaining,
    guaranteedPass,
    impossibleToPass,
    isFinal,
  };
}

export const AREA_ORDER: Area[] = ["CB", "CBI", "IA", "FC", "ESP"];

// Paleta "scrapbook": cada área es un color de pegatina sólido. `bg` se usa
// para el estado relleno (cursando/vista); `text` es el color del texto
// sobre ese relleno; `border` es siempre la tinta (ink) del boceto.
export const AREA_INFO: Record<
  Area,
  { label: string; bg: string; border: string; text: string }
> = {
  CB: {
    label: "Ciencias Básicas",
    bg: "var(--color-cobalt)",
    border: "var(--color-ink)",
    text: "var(--color-cream)",
  },
  CBI: {
    label: "Ciencias Básicas de Ingeniería",
    bg: "var(--color-grass)",
    border: "var(--color-ink)",
    text: "var(--color-cream)",
  },
  IA: {
    label: "Ingeniería Aplicada",
    bg: "var(--color-tomato)",
    border: "var(--color-ink)",
    text: "var(--color-cream)",
  },
  FC: {
    label: "Formación Complementaria",
    bg: "var(--color-tangerine)",
    border: "var(--color-ink)",
    text: "var(--color-ink)",
  },
  ESP: {
    label: "Profundización / Grado",
    bg: "var(--color-bubblegum)",
    border: "var(--color-ink)",
    text: "var(--color-ink)",
  },
};

export const TOTAL_CREDITS = 166;

// Fila fija de cada materia según el diagrama oficial (malla Plan 10).
// Cada "riel" temático (Cálculo, Álgebra, Algoritmos, Software, etc.)
// mantiene su fila a lo largo de los semestres.
export const COURSE_ROW: Record<string, number> = {
  // Fila 1 — Física / Hardware
  CBS00079: 1, // Física del Movimiento
  CBS00014: 1, // Electricidad y Magnetismo
  ING00078: 1, // Electrónica Digital
  ING01191: 1, // Arquitectura de Hardware
  ING01196: 1, // Sistemas Operativos
  ING01204: 1, // Metodología de la Investigación
  // Fila 2 — Estadística / Redes
  ING01193: 2, // Estadística Aplicada
  ING01198: 2, // Teoría de la Información
  ING01202: 2, // Redes de Comunicaciones
  ING01209: 2, // Gestión de Redes y Servicios
  // Fila 3 — Cálculo / Numérico
  CBS00379: 3, // Cálculo Diferencial
  CBS00382: 3, // Cálculo Integral
  CBS00415: 3, // Cálculo de Varias Variables
  CBS00412: 3, // Ecuaciones Diferenciales
  ING01199: 3, // Análisis Numérico
  ING01203: 3, // Investigación de Operaciones
  ING01210: 3, // Modelos y Simulación
  // Fila 4 — Álgebra / Profundización
  CBS00414: 4, // Geometría Vectorial
  CBS00408: 4, // Álgebra Lineal
  ING01225: 4, // Profundización 1
  ING01226: 4, // Profundización 2
  ING01227: 4, // Profundización 3
  // Fila 5 — Teoría de Lenguajes
  ING01192: 5, // Teoría de Lenguajes y Compiladores
  // Fila 6 — Discretas / Bases de Datos / IA
  ING01180: 6, // Matemáticas Discretas 1
  ING01182: 6, // Matemáticas Discretas 2
  ING01188: 6, // Bases de Datos 1
  ING01195: 6, // Bases de Datos 2
  ING01200: 6, // Inteligencia Artificial
  // Fila 7 — Sistemas y Org / Proyectos / Grado
  ING01205: 7, // Sistemas y Organizaciones
  ING01208: 7, // Formulación y Evaluación de Proyectos de TI
  ING01211: 7, // Gestión de Proyectos de TI
  ING01221: 7, // Trabajo de Grado
  // Fila 8 — Ingeniería de Software
  ING01178: 8, // Introducción al Área Profesional
  ING01185: 8, // Semiótica Informática
  ING01187: 8, // Análisis de Software
  ING01190: 8, // Diseño de Software
  ING01194: 8, // Proyecto de Construcción de SW
  ING01201: 8, // Pruebas y Gestión de la Configuración
  // Fila 9 — Taller de Lenguajes / Distribuida
  ING01184: 9, // Taller de Lenguajes de Programación 1
  ING01189: 9, // Taller de Lenguajes de Programación 2
  ING01206: 9, // Programación Distribuida y Paralela
  // Fila 10 — Algoritmos y Programación
  ING01179: 10, // Algoritmos y Programación 1
  ING01181: 10, // Algoritmos y Programación 2
  ING01183: 10, // Algoritmos y Programación 3
  ING01186: 10, // Algoritmos y Programación 4
  ING01207: 10, // Proyecto Integrador
  CBS00102: 10, // Ética
  // Fila 11 — Lengua / Deporte / Pedagogía / Electiva 1
  CBS00030: 11, // Lengua Materna
  EFD00533: 11, // Deporte, Arte y Recreación
  CBS00097: 11, // Pedagogía Constitucional
  ING01228: 11, // Electiva 1
  // Fila 12 — Humanidades / Electivas
  CBS00031: 12, // Humanidades 1
  ING01197: 12, // Emprendimiento Empresarial TI
  CAG00701: 12, // Ecología
  CBS00032: 12, // Humanidades 2
  ING01229: 12, // Electiva 2
  ING01230: 12, // Electiva 3
};

export const MAX_ROW = 12;
