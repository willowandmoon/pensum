import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { CAREERS } from "@/lib/types";

const DEFAULT_CAREER = CAREERS[0].value;

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  let career = DEFAULT_CAREER;
  let userId: number | null = null;

  if (email) {
    const userRows = await sql`SELECT id, career FROM users WHERE email = ${email}`;
    if (userRows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }
    userId = userRows[0].id;
    career = userRows[0].career ?? DEFAULT_CAREER;
  }

  const courses = await sql`
    SELECT code, name, level, credits, area, prereqs, coreqs
    FROM courses
    WHERE career = ${career}
    ORDER BY level ASC, name ASC
  `;

  let statuses: Record<string, string> = {};

  if (userId !== null) {
    const rows = await sql`
      SELECT course_code, status
      FROM user_course_status
      WHERE user_id = ${userId}
    `;
    statuses = Object.fromEntries(rows.map((r) => [r.course_code, r.status]));
  }

  return NextResponse.json({ courses, statuses });
}
