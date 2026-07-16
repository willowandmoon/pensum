export type Area =
  | "CB"
  | "CBI"
  | "IA"
  | "FC"
  | "ESP"
  | "INST"
  | "FAC"
  | "PROG"
  | "ELEC"
  | "IDI";

export type Status = "pending" | "current" | "completed";

// Estado visual real de una materia (combina el status guardado con si está
// bloqueada por prerrequisitos). Se usa para colorear tarjetas y listas de
// forma consistente en toda la app.
export type VisualStatus = "completed" | "current" | "blocked" | "available";

export function getVisualStatus(status: Status, locked: boolean): VisualStatus {
  if (status === "completed") return "completed";
  if (status === "current") return "current";
  return locked ? "blocked" : "available";
}

export const STATUS_INFO: Record<
  VisualStatus,
  { label: string; bg: string; border: string; text: string }
> = {
  completed: {
    label: "Vista",
    bg: "var(--color-grass)",
    border: "var(--color-ink)",
    text: "var(--color-cream)",
  },
  current: {
    label: "Este semestre",
    bg: "var(--color-cobalt)",
    border: "var(--color-ink)",
    text: "var(--color-cream)",
  },
  available: {
    label: "Disponible",
    bg: "var(--color-tangerine)",
    border: "var(--color-ink)",
    text: "var(--color-ink)",
  },
  blocked: {
    label: "Bloqueada",
    bg: "#b7b7ae",
    border: "var(--color-ink)",
    text: "var(--color-ink)",
  },
};

// Stickers que el usuario puede pegar en una materia ya vista, en vez de la
// cinta genérica de la esquina. Los archivos viven en /public/stickers/<pack>.
// El usuario elige un pack activo en Ajustes; el id de cada sticker se guarda
// con el prefijo del pack ("perrito/feliz") para que nunca choque con el id
// de otro pack y siga siendo válido aunque luego cambie de pack.
export interface StickerOption {
  id: string;
  src: string;
  label: string;
}

export interface StickerPack {
  id: string;
  label: string;
  stickers: StickerOption[];
}

function pack(packId: string, label: string, items: [string, string][]): StickerPack {
  return {
    id: packId,
    label,
    stickers: items.map(([slug, stickerLabel]) => ({
      id: `${packId}/${slug}`,
      src: `/stickers/${packId}/${slug}.png`,
      label: stickerLabel,
    })),
  };
}

export const STICKER_PACKS: StickerPack[] = [
  pack("perrito", "Perrito", [
    ["feliz", "Feliz"],
    ["enamorado", "Enamorado"],
    ["genial", "Genial"],
    ["aplausos", "Aplausos"],
    ["curioso", "Curioso"],
    ["sorprendido", "Sorprendido"],
    ["relajado", "Relajado"],
    ["dormido", "Dormido"],
    ["indiferente", "Indiferente"],
    ["timido", "Tímido"],
    ["llorando", "Llorando"],
    ["asustado-leve", "Asustado"],
    ["asustado", "Muy asustado"],
    ["mareado", "Mareado"],
    ["noqueado", "Noqueado"],
  ]),
  pack("kirby", "Kirby", [
    ["feliz", "Feliz"],
    ["super-feliz", "Súper feliz"],
    ["emocionado", "Emocionado"],
    ["carcajadas", "Riéndose a carcajadas"],
    ["sonrisa-timida", "Sonrisa tímida"],
    ["orgulloso", "Orgulloso"],
    ["celebrando", "Celebrando"],
    ["saltando-alegria", "Saltando de alegría"],
    ["guinando-ojo", "Guiñando un ojo"],
    ["enamorado", "Enamorado"],
    ["beso", "Mandando un beso"],
    ["abrazando-corazon", "Abrazando un corazón"],
    ["sonrojado", "Sonrojado"],
    ["muy-sonrojado", "Muy sonrojado"],
    ["me-quieres", "¿Me quieres?"],
    ["coqueto", "Coqueto"],
    ["carinoso", "Cariñoso"],
    ["triste", "Triste"],
    ["llorando", "Llorando"],
    ["llorando-mucho", "Llorando mucho"],
    ["puchero", "Puchero"],
    ["enojado", "Enojado"],
    ["muy-enojado", "Muy enojado"],
    ["furioso", "Furioso"],
    ["asustado", "Asustado"],
    ["panico", "En pánico"],
    ["sorprendido", "Sorprendido"],
    ["confundido", "Confundido"],
    ["pensando", "Pensando"],
    ["idea", "Idea"],
    ["mente-explotando", "Mente explotando"],
    ["cansado", "Cansado"],
    ["con-sueno", "Con sueño"],
    ["durmiendo", "Durmiendo"],
    ["hambreado", "Hambreado"],
    ["pizza", "Comiendo pizza"],
    ["hamburguesa", "Comiendo hamburguesa"],
    ["helado", "Comiendo helado"],
    ["cafe", "Tomando café"],
    ["jugando", "Jugando"],
    ["programando", "Programando"],
    ["musica", "Escuchando música"],
    ["paraguas", "Con paraguas"],
    ["lluvia", "En la lluvia"],
    ["gafas-sol", "Con gafas de sol"],
    ["estrella", "Estrella"],
    ["volando", "Volando"],
    ["disfrazado", "Disfrazado"],
    ["facepalm", "Facepalm"],
    ["rage", "Rage"],
  ]),
  pack("espi", "Espi", [
    ["neutral", "Neutral"],
    ["curiosa", "Curiosa"],
    ["feliz", "Feliz"],
    ["super-feliz", "Súper feliz"],
    ["sonriente", "Sonriente"],
    ["sonrojada", "Sonrojada"],
    ["timida", "Tímida"],
    ["me-quieres", "¿Me quieres?"],
    ["enamorada", "Enamorada"],
    ["guinando", "Guiñando"],
    ["beso", "Mandando un beso"],
    ["aburrida", "Aburrida"],
    ["pensativa", "Pensativa"],
    ["triste", "Triste"],
    ["enojada", "Enojada"],
    ["sorprendida", "Sorprendida"],
  ]),
  pack("cori", "Cori", [
    ["neutral", "Neutral"],
    ["feliz", "Feliz"],
    ["super-feliz", "Súper feliz"],
    ["sonriente", "Sonriente"],
    ["curioso", "Curioso"],
    ["sorprendido", "Sorprendido"],
    ["emocionado", "Emocionado"],
    ["timido", "Tímido"],
    ["enamorado", "Enamorado"],
    ["guinando", "Guiñando"],
    ["beso", "Mandando un beso"],
    ["pensativo", "Pensativo"],
    ["triste", "Triste"],
    ["enojado", "Enojado"],
    ["asustado", "Asustado"],
    ["dormilon", "Dormilón"],
  ]),
  pack("axo", "Axo", [
    ["neutral", "Neutral"],
    ["curioso", "Curioso"],
    ["serio", "Serio"],
    ["aburrido", "Aburrido"],
    ["esceptico", "Escéptico"],
    ["sonriente", "Sonriente"],
    ["enfadado", "Enfadado"],
    ["sorprendido", "Sorprendido"],
    ["triste", "Triste"],
    ["enamorado", "Enamorado"],
    ["relajado", "Relajado"],
    ["pensativo", "Pensativo"],
  ]),
];

export const DEFAULT_STICKER_PACK = STICKER_PACKS[0].id;

// Mapa plano id -> sticker (para pintar en la tarjeta un sticker ya elegido,
// sin importar cuál sea el pack activo del usuario en este momento).
export const STICKERS_BY_ID: Record<string, StickerOption> = Object.fromEntries(
  STICKER_PACKS.flatMap((p) => p.stickers.map((s) => [s.id, s]))
);

export interface Career {
  value: string;
  label: string;
  // Texto corto bajo el título de "Pensum" (número de plan, código SNIES, etc).
  planLabel: string;
  // Universidad/institución dueña de este pensum (se muestra al registrarse).
  institution: string;
}

export const CAREERS: Career[] = [
  {
    value: "ing-informatica",
    label: "Ingeniería Informática",
    planLabel: "Plan 8210",
    institution: "Politécnico Colombiano Jaime Isaza Cadavid",
  },
  {
    value: "administracion-empresas",
    label: "Administración de Empresas",
    planLabel: "SNIES 102847",
    institution: "Politécnico Grancolombiano",
  },
  {
    value: "tecnologia-recursos-ambientales",
    label: "Tecnología en Manejo de Recursos Ambientales",
    planLabel: "Pensum TRA2019-2",
    institution: "Unidades Tecnológicas de Santander",
  },
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
  // Pack de stickers activo (id de STICKER_PACKS) para decorar materias vistas.
  stickerPack: string;
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

export const AREA_ORDER: Area[] = [
  "CB",
  "CBI",
  "IA",
  "FC",
  "ESP",
  "INST",
  "FAC",
  "PROG",
  "ELEC",
  "IDI",
];

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
  // Áreas de Administración de Empresas (y otras carreras con este mismo
  // esquema institucional): Institucional / Facultad / Programa / Electivo.
  INST: {
    label: "Institucional",
    bg: "var(--color-cobalt)",
    border: "var(--color-ink)",
    text: "var(--color-cream)",
  },
  FAC: {
    label: "Facultad",
    bg: "var(--color-grass)",
    border: "var(--color-ink)",
    text: "var(--color-cream)",
  },
  PROG: {
    label: "Programa",
    bg: "var(--color-tangerine)",
    border: "var(--color-ink)",
    text: "var(--color-ink)",
  },
  ELEC: {
    label: "Electivo",
    bg: "var(--color-tomato)",
    border: "var(--color-ink)",
    text: "var(--color-cream)",
  },
  // Idiomas (ej. Unidades Tecnológicas de Santander).
  IDI: {
    label: "Idiomas",
    bg: "var(--color-bubblegum)",
    border: "var(--color-ink)",
    text: "var(--color-ink)",
  },
};

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

  // --- Administración de Empresas (Politécnico Grancolombiano) ---
  // La fila usa la misma posición de columna que ocupa la materia dentro
  // de su semestre en el diagrama oficial (1ra columna = fila 1, etc).
  // Fila 1
  ADM001: 1, // Matemáticas
  ADM005: 1, // Matemáticas II
  ADM009: 1, // Microeconomía
  ADM014: 1, // Macroeconomía
  ADM019: 1, // Modelo de Toma de Decisiones
  ADM024: 1, // Gerencia de Producción
  ADM029: 1, // Gerencia de Desarrollo Sostenible
  ADM034: 1, // Sistemas Integrados de Gestión (HSEQ)
  ADM039: 1, // Habilidades Gerenciales
  // Fila 2
  ADM002: 2, // Contabilidad General
  ADM006: 2, // Administración Financiera
  ADM010: 2, // Estadística I
  ADM015: 2, // Estadística II
  ADM020: 2, // Administración 4.0
  ADM025: 2, // Gestión del Talento Humano
  ADM030: 2, // Finanzas Corporativas
  ADM035: 2, // Gerencia Financiera
  ADM040: 2, // Opción de Grado
  // Fila 3
  ADM003: 3, // Teoría de las Organizaciones
  ADM007: 3, // Inglés General I
  ADM011: 3, // Costos y Presupuestos
  ADM016: 3, // Matemáticas Financieras
  ADM021: 3, // Oportunidades para Emprender
  ADM026: 3, // Evaluación de Proyectos
  ADM031: 3, // Gestión de Proyectos I
  ADM036: 3, // Gestión de Proyectos II
  ADM041: 3, // Pensamiento Estratégico y Prospectiva
  // Fila 4
  ADM004: 4, // Create Camps I
  ADM008: 4, // Create Camps II
  ADM012: 4, // Proceso Administrativo
  ADM017: 4, // Derecho Comercial y Laboral
  ADM022: 4, // Fundamentos de Mercadeo
  ADM027: 4, // Proceso Estratégico I
  ADM032: 4, // Proceso Estratégico II
  ADM037: 4, // Tendencias Estratégicas
  ADM042: 4, // Desarrollo Empresarial
  // Fila 5
  ADM013: 5, // Inglés General II
  ADM018: 5, // Inglés General III
  ADM023: 5, // Inglés General IV
  ADM028: 5, // Comercio Internacional
  ADM033: 5, // Generalidades de Riesgo
  ADM038: 5, // Electiva I
  ADM043: 5, // Electiva II

  // --- Tecnología en Manejo de Recursos Ambientales (UTS) ---
  // No hay diagrama oficial (el pensum viene en tabla), así que las filas
  // agrupan cadenas de prerrequisito y materias afines por tema.
  // Fila 1 — Física
  DCB001: 1, // Álgebra Superior
  DCB009: 1, // Mecánica
  DCB010: 1, // Electromagnetismo
  DCB011: 1, // Laboratorio de Física
  // Fila 2 — Cálculo
  DCB002: 2, // Cálculo Diferencial
  DCB003: 2, // Cálculo Integral
  DCB008: 2, // Cálculo Multivariable
  // Fila 3 — Biología / Ecología / Recurso Aire
  TRA102: 3, // Biología
  TRA303: 3, // Fauna
  TRA403: 3, // Ecología Ambiental
  TRA404: 3, // Microbiología Ambiental
  TRA501: 3, // Recurso Aire
  TRA502: 3, // Laboratorio del Recurso Aire
  // Fila 4 — Dibujo / Cartografía / Geología / Recurso Suelo
  TRA101: 4, // Dibujo
  TRA202: 4, // Cartografía y Topografía
  TRA304: 4, // Geología Ambiental
  TRA503: 4, // Recurso Suelo
  TRA504: 4, // Laboratorio del Recurso Suelo
  // Fila 5 — Química / Recurso Agua / Residuos
  TRA204: 5, // Química Inorgánica
  TRA305: 5, // Química Orgánica
  TRA401: 5, // Recurso Agua
  TRA402: 5, // Laboratorio de Recurso Agua
  TRA609: 5, // Residuos Sólidos
  // Fila 6 — Flora / Legislación / Termodinámica / Saneamiento / Efectos
  TRA203: 6, // Flora
  TRA405: 6, // Legislación Ambiental
  TRA509: 6, // Principios de Termodinámica
  TRA510: 6, // Saneamiento Básico y Ambiental
  TRA603: 6, // Identificación de Efectos Ambientales
  // Fila 7 — Humanidades / Idiomas
  DHI016: 7, // Cultura Física
  DHI029: 7, // Epistemología
  DDI009: 7, // Inglés I
  DDI010: 7, // Inglés II
  TRA608: 7, // Educación Ambiental
  // Fila 8 — Humanidades / Optativas
  DHI014: 8, // Procesos de Lectura y Escritura
  DHO00A: 8, // Optativa I
  DHO00B: 8, // Optativa II
  DHI023: 8, // Metodología de la Investigación I
  DHI003: 8, // Ética
  // Fila 9 — Electivas de Profundización
  TRA00R: 9, // Electiva de Profundización
  TRA00S: 9, // Electiva de Profundización
  TRA00T: 9, // Electiva de Profundización
};
