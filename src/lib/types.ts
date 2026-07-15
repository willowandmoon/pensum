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

export const AREA_ORDER: Area[] = ["CB", "CBI", "IA", "FC", "ESP"];

export const AREA_INFO: Record<
  Area,
  { label: string; bg: string; border: string; text: string }
> = {
  CB: {
    label: "Ciencias Básicas",
    bg: "#FFD966",
    border: "#D4A017",
    text: "#4A3800",
  },
  CBI: {
    label: "Ciencias Básicas de Ingeniería",
    bg: "#A9D18E",
    border: "#548235",
    text: "#274016",
  },
  IA: {
    label: "Ingeniería Aplicada",
    bg: "#F4B6B0",
    border: "#C0504D",
    text: "#5C1A17",
  },
  FC: {
    label: "Formación Complementaria",
    bg: "#9DC3E6",
    border: "#2E5F8A",
    text: "#122B40",
  },
  ESP: {
    label: "Profundización / Grado",
    bg: "#D9D9D9",
    border: "#8C8C8C",
    text: "#333333",
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
