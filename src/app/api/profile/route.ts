import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function isValidSemester(v: unknown): v is number | null {
  return v === null || (typeof v === "number" && v >= 1 && v <= 10);
}

function isValidAverage(v: unknown): v is number | null {
  return v === null || (typeof v === "number" && v >= 0 && v <= 5);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !body) {
    return NextResponse.json({ error: "Falta el correo." }, { status: 400 });
  }

  const hasCurrentSemester = Object.prototype.hasOwnProperty.call(body, "currentSemester");
  const hasBaselineAverage = Object.prototype.hasOwnProperty.call(body, "baselineAverage");
  const hasBaselineSemesterAverage = Object.prototype.hasOwnProperty.call(
    body,
    "baselineSemesterAverage"
  );

  if (hasCurrentSemester && !isValidSemester(body.currentSemester)) {
    return NextResponse.json({ error: "El semestre debe estar entre 1 y 10." }, { status: 400 });
  }
  if (hasBaselineAverage && !isValidAverage(body.baselineAverage)) {
    return NextResponse.json(
      { error: "El promedio acumulado debe estar entre 0.0 y 5.0." },
      { status: 400 }
    );
  }
  if (hasBaselineSemesterAverage && !isValidAverage(body.baselineSemesterAverage)) {
    return NextResponse.json(
      { error: "El promedio semestral debe estar entre 0.0 y 5.0." },
      { status: 400 }
    );
  }

  const userRows = await sql`
    SELECT id, current_semester, baseline_average, baseline_semester_average,
           baseline_credits, baseline_course_codes
    FROM users WHERE email = ${email}
  `;
  if (userRows.length === 0) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  const user = userRows[0];
  const userId = user.id;

  const currentSemester = hasCurrentSemester ? body.currentSemester : user.current_semester;
  let baselineAverage = hasBaselineAverage ? body.baselineAverage : user.baseline_average;
  let baselineSemesterAverage = hasBaselineSemesterAverage
    ? body.baselineSemesterAverage
    : user.baseline_semester_average;
  let baselineCredits = user.baseline_credits;
  let baselineCourseCodes = user.baseline_course_codes ?? [];

  // La "foto" de qué materias/créditos ya tenía vistas se captura UNA sola
  // vez, la primera vez que se guarda un promedio de partida.
  if ((hasBaselineAverage || hasBaselineSemesterAverage) && baselineCredits === null) {
    const completed = await sql`
      SELECT c.code, c.credits FROM user_course_status ucs
      JOIN courses c ON c.code = ucs.course_code
      WHERE ucs.user_id = ${userId} AND ucs.status = 'completed'
    `;
    baselineCourseCodes = completed.map((r) => r.code);
    baselineCredits = completed.reduce((sum, r) => sum + r.credits, 0);
  }

  const rows = await sql`
    UPDATE users
    SET current_semester = ${currentSemester},
        baseline_average = ${baselineAverage},
        baseline_semester_average = ${baselineSemesterAverage},
        baseline_credits = ${baselineCredits},
        baseline_course_codes = ${baselineCourseCodes}
    WHERE id = ${userId}
    RETURNING email, name, career, current_semester, baseline_average,
              baseline_semester_average, baseline_credits, baseline_course_codes
  `;

  const row = rows[0];
  return NextResponse.json({
    user: {
      email: row.email,
      name: row.name,
      career: row.career,
      currentSemester: row.current_semester,
      baselineAverage: row.baseline_average !== null ? Number(row.baseline_average) : null,
      baselineSemesterAverage:
        row.baseline_semester_average !== null ? Number(row.baseline_semester_average) : null,
      baselineCredits: row.baseline_credits,
      baselineCourseCodes: row.baseline_course_codes ?? [],
    },
  });
}
