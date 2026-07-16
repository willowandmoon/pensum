import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { STICKERS_BY_ID } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const courseCode = body?.courseCode;
  const sticker: string | null = body?.sticker ?? null;

  if (!email || !courseCode || (sticker !== null && !STICKERS_BY_ID[sticker])) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const userRows = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (userRows.length === 0) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  const userId = userRows[0].id;

  await sql`
    UPDATE user_course_status
    SET sticker = ${sticker}
    WHERE user_id = ${userId} AND course_code = ${courseCode}
  `;

  return NextResponse.json({ ok: true });
}
