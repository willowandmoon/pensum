import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

async function getUserId(email: string): Promise<number | null> {
  const rows = await sql`SELECT id FROM users WHERE email = ${email}`;
  return rows.length > 0 ? rows[0].id : null;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Falta el correo." }, { status: 400 });
  }

  const userId = await getUserId(email);
  if (userId === null) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const rows = await sql`
    SELECT id, course_code, description, score, weight
    FROM course_grades
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
  `;

  const grades = rows.map((r) => ({
    id: r.id,
    courseCode: r.course_code,
    description: r.description,
    score: Number(r.score),
    weight: Number(r.weight),
  }));

  return NextResponse.json({ grades });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const courseCode = typeof body?.courseCode === "string" ? body.courseCode : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const score = Number(body?.score);
  const weight = Number(body?.weight);

  if (!email || !courseCode || !description) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }
  if (!Number.isFinite(score) || score < 0 || score > 5) {
    return NextResponse.json({ error: "La nota debe estar entre 0.0 y 5.0." }, { status: 400 });
  }
  if (!Number.isFinite(weight) || weight <= 0 || weight > 100) {
    return NextResponse.json({ error: "El porcentaje debe estar entre 1 y 100." }, { status: 400 });
  }

  const userId = await getUserId(email);
  if (userId === null) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const existing = await sql`
    SELECT COALESCE(SUM(weight), 0) AS total FROM course_grades
    WHERE user_id = ${userId} AND course_code = ${courseCode}
  `;
  const totalSoFar = Number(existing[0].total);
  if (totalSoFar + weight > 100.01) {
    return NextResponse.json(
      { error: `Ya tienes ${totalSoFar}% asignado en esta materia; solo puedes agregar hasta ${(100 - totalSoFar).toFixed(1)}% más.` },
      { status: 400 }
    );
  }

  const rows = await sql`
    INSERT INTO course_grades (user_id, course_code, description, score, weight)
    VALUES (${userId}, ${courseCode}, ${description}, ${score}, ${weight})
    RETURNING id, course_code, description, score, weight
  `;
  const row = rows[0];

  return NextResponse.json({
    grade: {
      id: row.id,
      courseCode: row.course_code,
      description: row.description,
      score: Number(row.score),
      weight: Number(row.weight),
    },
  });
}

export async function DELETE(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const id = Number(req.nextUrl.searchParams.get("id"));

  if (!email || !Number.isFinite(id)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const userId = await getUserId(email);
  if (userId === null) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  await sql`DELETE FROM course_grades WHERE id = ${id} AND user_id = ${userId}`;
  return NextResponse.json({ ok: true });
}
