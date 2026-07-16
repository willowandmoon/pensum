import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { CAREERS } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const career = typeof body?.career === "string" ? body.career : "";

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Escribe tu nombre completo." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 400 }
    );
  }
  if (!CAREERS.some((c) => c.value === career)) {
    return NextResponse.json({ error: "Selecciona una carrera válida." }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese correo." },
      { status: 409 }
    );
  }

  const passwordHash = hashPassword(password);
  const rows = await sql`
    INSERT INTO users (name, email, password_hash, career)
    VALUES (${name}, ${email}, ${passwordHash}, ${career})
    RETURNING email, name, career, current_semester,
              baseline_average, baseline_semester_average, baseline_credits, baseline_course_codes,
              sticker_pack
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
      stickerPack: row.sticker_pack,
    },
  });
}
