import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

async function getUserId(email: string): Promise<number | null> {
  const rows = await sql`SELECT id FROM users WHERE email = ${email}`;
  return rows.length > 0 ? rows[0].id : null;
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

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
    SELECT id, course_code, day_of_week, start_time, end_time
    FROM schedule_blocks
    WHERE user_id = ${userId}
    ORDER BY day_of_week ASC, start_time ASC
  `;

  const blocks = rows.map((r) => ({
    id: r.id,
    courseCode: r.course_code,
    dayOfWeek: r.day_of_week,
    startTime: r.start_time,
    endTime: r.end_time,
  }));

  return NextResponse.json({ blocks });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const courseCode = typeof body?.courseCode === "string" ? body.courseCode : "";
  const dayOfWeek = Number(body?.dayOfWeek);
  const startTime = typeof body?.startTime === "string" ? body.startTime : "";
  const endTime = typeof body?.endTime === "string" ? body.endTime : "";

  if (!email || !courseCode) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 5) {
    return NextResponse.json({ error: "Día inválido." }, { status: 400 });
  }
  if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime) || startTime >= endTime) {
    return NextResponse.json(
      { error: "La hora de inicio debe ser antes que la de fin." },
      { status: 400 }
    );
  }

  const userId = await getUserId(email);
  if (userId === null) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  // Evita que el mismo horario se cruce con otro bloque ya asignado.
  const overlap = await sql`
    SELECT id FROM schedule_blocks
    WHERE user_id = ${userId} AND day_of_week = ${dayOfWeek}
      AND start_time < ${endTime} AND end_time > ${startTime}
  `;
  if (overlap.length > 0) {
    return NextResponse.json(
      { error: "Ese horario se cruza con una materia que ya tienes agendada." },
      { status: 409 }
    );
  }

  const rows = await sql`
    INSERT INTO schedule_blocks (user_id, course_code, day_of_week, start_time, end_time)
    VALUES (${userId}, ${courseCode}, ${dayOfWeek}, ${startTime}, ${endTime})
    RETURNING id, course_code, day_of_week, start_time, end_time
  `;
  const row = rows[0];

  return NextResponse.json({
    block: {
      id: row.id,
      courseCode: row.course_code,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
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

  await sql`DELETE FROM schedule_blocks WHERE id = ${id} AND user_id = ${userId}`;
  return NextResponse.json({ ok: true });
}
