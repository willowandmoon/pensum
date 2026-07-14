import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const VALID_STATUSES = new Set(["pending", "current", "completed"]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = body?.username?.trim().toLowerCase();
  const courseCode = body?.courseCode;
  const status = body?.status;

  if (!username || !courseCode || !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const userRows = await sql`SELECT id FROM users WHERE username = ${username}`;
  if (userRows.length === 0) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  const userId = userRows[0].id;

  if (status === "pending") {
    await sql`
      DELETE FROM user_course_status
      WHERE user_id = ${userId} AND course_code = ${courseCode}
    `;
  } else {
    await sql`
      INSERT INTO user_course_status (user_id, course_code, status)
      VALUES (${userId}, ${courseCode}, ${status})
      ON CONFLICT (user_id, course_code)
      DO UPDATE SET status = EXCLUDED.status, updated_at = now()
    `;
  }

  return NextResponse.json({ ok: true });
}
