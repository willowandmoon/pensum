import { neon } from "@neondatabase/serverless";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const sql = neon(process.env.DATABASE_URL);

// code, name, level (semestre 1-10), credits, area, prereqs (course codes)
// area sigue el color real del diagrama oficial:
//   CB  = Ciencias Básicas (amarillo)
//   CBI = Ciencias Básicas de Ingeniería (verde)
//   IA  = Ingeniería Aplicada (rosado)
//   FC  = Formación Complementaria (azul)
//   ESP = Profundización / Trabajo de Grado (gris)
const courses = [
  // Nivel 1
  ["CBS00030", "Lengua Materna", 1, 2, "FC", []],
  ["CBS00379", "Cálculo Diferencial", 1, 3, "CB", []],
  ["ING01178", "Introducción al Área Profesional", 1, 3, "CBI", []],
  ["ING01179", "Algoritmos y Programación 1", 1, 4, "IA", []],
  ["ING01180", "Matemáticas Discretas 1", 1, 4, "CBI", []],
  ["CBS00031", "Humanidades 1", 1, 2, "FC", []],
  // Nivel 2
  ["CBS00079", "Física del Movimiento", 2, 4, "CB", []],
  ["CBS00382", "Cálculo Integral", 2, 3, "CB", ["CBS00379"], ["CBS00079"]],
  ["CBS00414", "Geometría Vectorial", 2, 3, "CB", []],
  ["ING01181", "Algoritmos y Programación 2", 2, 4, "IA", ["ING01179"]],
  ["ING01182", "Matemáticas Discretas 2", 2, 4, "CBI", ["ING01180"]],
  ["EFD00533", "Deporte, Arte y Recreación", 2, 1, "FC", []],
  // Nivel 3
  ["CBS00014", "Electricidad y Magnetismo", 3, 4, "CB", ["CBS00079"]],
  ["CBS00408", "Álgebra Lineal", 3, 3, "CB", ["CBS00414"], ["ING01185"]],
  ["CBS00415", "Cálculo de Varias Variables", 3, 3, "CB", ["CBS00382"]],
  ["ING01183", "Algoritmos y Programación 3", 3, 3, "IA", ["ING01181"]],
  ["ING01184", "Taller de Lenguajes de Programación 1", 3, 2, "IA", ["ING01181"]],
  ["ING01185", "Semiótica Informática", 3, 2, "CBI", ["ING01178"]],
  ["CBS00097", "Pedagogía Constitucional", 3, 1, "FC", []],
  // Nivel 4
  ["CBS00412", "Ecuaciones Diferenciales", 4, 3, "CB", ["CBS00415"]],
  ["ING00078", "Electrónica Digital", 4, 4, "CBI", ["CBS00014"]],
  ["ING01186", "Algoritmos y Programación 4", 4, 3, "IA", ["ING01183"]],
  ["ING01187", "Análisis de Software", 4, 4, "IA", ["ING01185", "ING01184"]],
  ["ING01188", "Bases de Datos 1", 4, 4, "IA", ["ING01182"]],
  // Nivel 5
  ["ING01189", "Taller de Lenguajes de Programación 2", 5, 2, "IA", ["ING01186"]],
  ["ING01190", "Diseño de Software", 5, 4, "IA", ["ING01187", "ING01188"]],
  ["ING01191", "Arquitectura de Hardware", 5, 4, "CBI", ["ING00078"]],
  ["ING01192", "Teoría de Lenguajes y Compiladores", 5, 4, "CBI", ["ING01182", "ING01184"]],
  ["ING01193", "Estadística Aplicada", 5, 4, "CBI", ["CBS00382"]],
  // Nivel 6
  ["ING01194", "Proyecto de Construcción de SW", 6, 2, "IA", ["ING01186", "ING01190"]],
  ["ING01195", "Bases de Datos 2", 6, 3, "IA", ["ING01188"]],
  ["ING01196", "Sistemas Operativos", 6, 4, "CBI", ["ING01191"]],
  ["ING01197", "Emprendimiento Empresarial TI", 6, 2, "FC", []],
  ["ING01198", "Teoría de la Información", 6, 3, "CBI", ["ING01193"]],
  ["ING01199", "Análisis Numérico", 6, 4, "CBI", ["CBS00408", "CBS00412"]],
  // Nivel 7
  ["ING01200", "Inteligencia Artificial", 7, 2, "CBI", ["ING01186", "ING01199"]],
  ["ING01201", "Pruebas y Gestión de la Configuración", 7, 2, "IA", ["ING01194"]],
  ["ING01202", "Redes de Comunicaciones", 7, 4, "IA", ["ING01198"]],
  ["ING01203", "Investigación de Operaciones", 7, 4, "CBI", ["CBS00408", "ING01193"]],
  ["ING01204", "Metodología de la Investigación", 7, 2, "CBI", ["ING01193"]],
  ["ING01205", "Sistemas y Organizaciones", 7, 2, "FC", []],
  ["CAG00701", "Ecología", 7, 1, "FC", []],
  // Nivel 8
  ["ING01206", "Programación Distribuida y Paralela", 8, 2, "IA", ["ING01202", "ING01189"]],
  ["ING01207", "Proyecto Integrador", 8, 2, "IA", ["ING01194"]],
  ["ING01208", "Formulación y Evaluación de Proyectos de TI", 8, 3, "FC", ["ING01194", "ING01205"]],
  ["ING01209", "Gestión de Redes y Servicios", 8, 3, "IA", ["ING01202"]],
  ["ING01210", "Modelos y Simulación", 8, 3, "CBI", ["ING01203"]],
  ["CBS00032", "Humanidades 2", 8, 2, "FC", []],
  ["ING01225", "Profundización 1", 8, 3, "ESP", []],
  // Nivel 9
  ["ING01211", "Gestión de Proyectos de TI", 9, 3, "FC", ["ING01208"]],
  ["CBS00102", "Ética", 9, 1, "FC", []],
  ["ING01226", "Profundización 2", 9, 3, "ESP", []],
  ["ING01228", "Electiva 1", 9, 2, "FC", []],
  ["ING01229", "Electiva 2", 9, 2, "FC", []],
  // Nivel 10
  ["ING01221", "Trabajo de Grado", 10, 7, "ESP", ["ING01211", "ING01204"]],
  ["ING01227", "Profundización 3", 10, 2, "ESP", []],
  ["ING01230", "Electiva 3", 10, 2, "FC", []],
];

async function main() {
  console.log("Creando tablas...");
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      level INT NOT NULL,
      credits INT NOT NULL,
      area TEXT NOT NULL,
      prereqs TEXT[] NOT NULL DEFAULT '{}',
      coreqs TEXT[] NOT NULL DEFAULT '{}'
    )
  `;
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS coreqs TEXT[] NOT NULL DEFAULT '{}'`;
  await sql`
    CREATE TABLE IF NOT EXISTS user_course_status (
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('pending','current','completed')),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, course_code)
    )
  `;

  console.log(`Insertando ${courses.length} materias...`);
  for (const [code, name, level, credits, area, prereqs, coreqs = []] of courses) {
    await sql`
      INSERT INTO courses (code, name, level, credits, area, prereqs, coreqs)
      VALUES (${code}, ${name}, ${level}, ${credits}, ${area}, ${prereqs}, ${coreqs})
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        level = EXCLUDED.level,
        credits = EXCLUDED.credits,
        area = EXCLUDED.area,
        prereqs = EXCLUDED.prereqs,
        coreqs = EXCLUDED.coreqs
    `;
  }

  const [{ count }] = await sql`SELECT count(*)::int FROM courses`;
  const [{ sum }] = await sql`SELECT sum(credits)::int FROM courses`;
  console.log(`Listo. ${count} materias, ${sum} créditos en la base de datos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
