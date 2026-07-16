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

// Administración de Empresas — Politécnico Grancolombiano (SNIES 102847).
// area: I=Institucional, F=Facultad, P=Programa, E=Electivo (mapeados a
// INST/FAC/PROG/ELEC en lib/types.ts).
const coursesAdministracion = [
  // Nivel 1
  ["ADM001", "Matemáticas", 1, 3, "INST", []],
  ["ADM002", "Contabilidad General", 1, 3, "FAC", []],
  ["ADM003", "Teoría de las Organizaciones", 1, 3, "FAC", []],
  ["ADM004", "Create Camps I", 1, 6, "INST", []],
  // Nivel 2
  ["ADM005", "Matemáticas II", 2, 3, "FAC", ["ADM001"]],
  ["ADM006", "Administración Financiera", 2, 3, "FAC", []],
  ["ADM007", "Inglés General I", 2, 3, "PROG", []],
  ["ADM008", "Create Camps II", 2, 6, "INST", []],
  // Nivel 3
  ["ADM009", "Microeconomía", 3, 3, "FAC", ["ADM001"]],
  ["ADM010", "Estadística I", 3, 3, "FAC", ["ADM001"]],
  ["ADM011", "Costos y Presupuestos", 3, 3, "PROG", ["ADM002"]],
  ["ADM012", "Proceso Administrativo", 3, 3, "FAC", []],
  ["ADM013", "Inglés General II", 3, 3, "PROG", ["ADM007"]],
  // Nivel 4
  ["ADM014", "Macroeconomía", 4, 3, "FAC", []],
  ["ADM015", "Estadística II", 4, 3, "FAC", ["ADM010"]],
  ["ADM016", "Matemáticas Financieras", 4, 3, "FAC", []],
  ["ADM017", "Derecho Comercial y Laboral", 4, 3, "PROG", []],
  ["ADM018", "Inglés General III", 4, 3, "PROG", ["ADM013"]],
  // Nivel 5
  ["ADM019", "Modelo de Toma de Decisiones", 5, 3, "FAC", ["ADM001"]],
  ["ADM020", "Administración 4.0", 5, 3, "PROG", []],
  ["ADM021", "Oportunidades para Emprender", 5, 3, "PROG", []],
  ["ADM022", "Fundamentos de Mercadeo", 5, 3, "FAC", []],
  ["ADM023", "Inglés General IV", 5, 3, "PROG", ["ADM018"]],
  // Nivel 6
  ["ADM024", "Gerencia de Producción", 6, 3, "PROG", []],
  ["ADM025", "Gestión del Talento Humano", 6, 3, "FAC", []],
  ["ADM026", "Evaluación de Proyectos", 6, 3, "PROG", ["ADM016"]],
  ["ADM027", "Proceso Estratégico I", 6, 3, "PROG", ["ADM012"]],
  ["ADM028", "Comercio Internacional", 6, 3, "PROG", []],
  // Nivel 7
  ["ADM029", "Gerencia de Desarrollo Sostenible", 7, 3, "PROG", []],
  ["ADM030", "Finanzas Corporativas", 7, 3, "PROG", []],
  ["ADM031", "Gestión de Proyectos I", 7, 3, "PROG", ["ADM021"]],
  ["ADM032", "Proceso Estratégico II", 7, 3, "PROG", ["ADM027"]],
  ["ADM033", "Generalidades de Riesgo", 7, 3, "PROG", []],
  // Nivel 8
  ["ADM034", "Sistemas Integrados de Gestión (HSEQ)", 8, 3, "PROG", []],
  ["ADM035", "Gerencia Financiera", 8, 3, "FAC", ["ADM030"]],
  ["ADM036", "Gestión de Proyectos II", 8, 3, "PROG", ["ADM031"]],
  ["ADM037", "Tendencias Estratégicas", 8, 3, "PROG", []],
  ["ADM038", "Electiva I", 8, 3, "ELEC", []],
  // Nivel 9
  ["ADM039", "Habilidades Gerenciales", 9, 3, "PROG", []],
  ["ADM040", "Opción de Grado", 9, 3, "FAC", ["ADM026"]],
  ["ADM041", "Pensamiento Estratégico y Prospectiva", 9, 3, "PROG", ["ADM027"]],
  ["ADM042", "Desarrollo Empresarial", 9, 3, "PROG", ["ADM032"]],
  ["ADM043", "Electiva II", 9, 3, "ELEC", []],
];

// Tecnología en Manejo de Recursos Ambientales — Unidades Tecnológicas de
// Santander (UTS). Códigos y créditos tal como vienen en el reporte
// Academusoft (PENSUM TRA2019-2). area: DCB->CB, DHI->FC, DDI->IDI,
// DHO->ELEC (optativas libres), TRA->PROG (núcleo del programa).
const coursesTecAmbiental = [
  // Período 1
  ["DCB001", "Álgebra Superior", 1, 4, "CB", []],
  ["TRA102", "Biología", 1, 3, "PROG", []],
  ["DCB002", "Cálculo Diferencial", 1, 4, "CB", []],
  ["TRA101", "Dibujo", 1, 1, "PROG", []],
  ["DHI014", "Procesos de Lectura y Escritura", 1, 2, "FC", []],
  ["DHI016", "Cultura Física", 1, 1, "FC", []],
  // Período 2
  ["TRA202", "Cartografía y Topografía", 2, 2, "PROG", ["TRA101"]],
  ["TRA303", "Fauna", 2, 2, "PROG", ["TRA102"]],
  ["TRA203", "Flora", 2, 2, "PROG", ["TRA102"]],
  ["DCB009", "Mecánica", 2, 4, "CB", ["DCB001"]],
  ["TRA204", "Química Inorgánica", 2, 3, "PROG", []],
  ["DCB003", "Cálculo Integral", 2, 4, "CB", ["DCB002"]],
  // Período 3
  ["TRA403", "Ecología Ambiental", 3, 2, "PROG", ["TRA303", "TRA203"]],
  ["TRA304", "Geología Ambiental", 3, 2, "PROG", ["TRA202"]],
  ["DHO00A", "Optativa I", 3, 2, "ELEC", []],
  ["DCB010", "Electromagnetismo", 3, 4, "CB", ["DCB009", "DCB003"]],
  ["DHI029", "Epistemología", 3, 2, "FC", []],
  ["TRA405", "Legislación Ambiental", 3, 3, "PROG", []],
  ["TRA305", "Química Orgánica", 3, 3, "PROG", ["TRA204"]],
  // Período 4
  ["DDI009", "Inglés I", 4, 2, "IDI", []],
  ["TRA404", "Microbiología Ambiental", 4, 2, "PROG", []],
  ["TRA00R", "Electiva de Profundización", 4, 3, "ELEC", []],
  ["DCB011", "Laboratorio de Física", 4, 1, "CB", ["DCB010"]],
  ["DHO00B", "Optativa II", 4, 2, "ELEC", []],
  ["TRA509", "Principios de Termodinámica", 4, 2, "PROG", []],
  ["TRA401", "Recurso Agua", 4, 4, "PROG", ["TRA305"]],
  // Período 5
  ["TRA402", "Laboratorio de Recurso Agua", 5, 1, "PROG", ["TRA401"]],
  ["TRA501", "Recurso Aire", 5, 4, "PROG", []],
  ["TRA00S", "Electiva de Profundización", 5, 3, "ELEC", []],
  ["DDI010", "Inglés II", 5, 2, "IDI", ["DDI009"]],
  ["DHI023", "Metodología de la Investigación I", 5, 2, "FC", []],
  ["TRA503", "Recurso Suelo", 5, 4, "PROG", ["TRA304"]],
  ["TRA510", "Saneamiento Básico y Ambiental", 5, 2, "PROG", []],
  // Período 6
  ["TRA603", "Identificación de Efectos Ambientales", 6, 2, "PROG", []],
  ["TRA608", "Educación Ambiental", 6, 2, "PROG", []],
  ["TRA00T", "Electiva de Profundización", 6, 3, "ELEC", []],
  ["TRA502", "Laboratorio del Recurso Aire", 6, 1, "PROG", ["TRA501"]],
  ["TRA504", "Laboratorio del Recurso Suelo", 6, 1, "PROG", ["TRA503"]],
  ["TRA609", "Residuos Sólidos", 6, 4, "PROG", []],
  ["DCB008", "Cálculo Multivariable", 6, 4, "CB", []],
  ["DHI003", "Ética", 6, 2, "FC", []],
];

const CAREER_COURSE_LISTS = [
  { career: "ing-informatica", list: courses },
  { career: "administracion-empresas", list: coursesAdministracion },
  { career: "tecnologia-recursos-ambientales", list: coursesTecAmbiental },
];

async function main() {
  console.log("Creando tablas...");
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Migración: de "username" simple a registro real con correo/contraseña/carrera.
  await sql`ALTER TABLE users ALTER COLUMN username DROP NOT NULL`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS career TEXT`;
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
      ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
      END IF;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      level INT NOT NULL,
      credits INT NOT NULL,
      area TEXT NOT NULL,
      prereqs TEXT[] NOT NULL DEFAULT '{}',
      coreqs TEXT[] NOT NULL DEFAULT '{}',
      career TEXT NOT NULL DEFAULT 'ing-informatica'
    )
  `;
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS coreqs TEXT[] NOT NULL DEFAULT '{}'`;
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS career TEXT NOT NULL DEFAULT 'ing-informatica'`;
  await sql`
    CREATE TABLE IF NOT EXISTS user_course_status (
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('pending','current','completed')),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, course_code)
    )
  `;
  // Sticker elegido por el usuario para decorar una materia (reemplaza la
  // cinta genérica de la esquina). Se limpia solo si la materia se borra.
  await sql`ALTER TABLE user_course_status ADD COLUMN IF NOT EXISTS sticker TEXT`;

  // Pack de stickers activo del usuario (ver STICKER_PACKS en lib/types.ts).
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS sticker_pack TEXT NOT NULL DEFAULT 'perrito'`;

  // Semestre actual (el usuario lo indica manualmente en Ajustes).
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS current_semester INT`;

  // Promedio de partida: cuando el estudiante empieza a usar la app ya trae
  // un historial académico previo. Estos valores se capturan UNA VEZ en
  // Ajustes (junto con una "foto" de qué materias y créditos tenía vistas en
  // ese momento) y desde ahí la app combina esa base con las notas nuevas
  // que se vayan registrando en Mis materias para recalcular solo.
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS baseline_average NUMERIC(3,2)`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS baseline_semester_average NUMERIC(3,2)`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS baseline_credits INT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS baseline_course_codes TEXT[] NOT NULL DEFAULT '{}'`;

  // Notas: cada materia puede tener varias notas parciales (descripción, nota
  // obtenida sobre 5.0, porcentaje que vale).
  await sql`
    CREATE TABLE IF NOT EXISTS course_grades (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
      description TEXT NOT NULL,
      score NUMERIC(4,2) NOT NULL,
      weight NUMERIC(5,2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Horario: bloques de día/hora que el estudiante asigna a sus materias.
  await sql`
    CREATE TABLE IF NOT EXISTS schedule_blocks (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
      day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  const totalCourses = CAREER_COURSE_LISTS.reduce((sum, c) => sum + c.list.length, 0);
  console.log(`Insertando ${totalCourses} materias...`);
  for (const { career, list } of CAREER_COURSE_LISTS) {
    for (const [code, name, level, credits, area, prereqs, coreqs = []] of list) {
      await sql`
        INSERT INTO courses (code, name, level, credits, area, prereqs, coreqs, career)
        VALUES (${code}, ${name}, ${level}, ${credits}, ${area}, ${prereqs}, ${coreqs}, ${career})
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          level = EXCLUDED.level,
          credits = EXCLUDED.credits,
          area = EXCLUDED.area,
          prereqs = EXCLUDED.prereqs,
          coreqs = EXCLUDED.coreqs,
          career = EXCLUDED.career
      `;
    }
  }

  const [{ count }] = await sql`SELECT count(*)::int FROM courses`;
  const [{ sum }] = await sql`SELECT sum(credits)::int FROM courses`;
  console.log(`Listo. ${count} materias, ${sum} créditos en la base de datos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
