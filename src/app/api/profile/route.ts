import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const currentSemester = body?.currentSemester;

  if (!email) {
    return NextResponse.json({ error: "Falta el correo." }, { status: 400 });
  }
  if (
    currentSemester !== null &&
    (typeof currentSemester !== "number" || currentSemester < 1 || currentSemester > 10)
  ) {
    return NextResponse.json(
      { error: "El semestre debe estar entre 1 y 10." },
      { status: 400 }
    );
  }

  const rows = await sql`
    UPDATE users
    SET current_semester = ${currentSemester}
    WHERE email = ${email}
    RETURNING email, name, career, current_semester
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const row = rows[0];
  return NextResponse.json({
    user: {
      email: row.email,
      name: row.name,
      career: row.career,
      currentSemester: row.current_semester,
    },
  });
}
