import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim().toLowerCase();

  const courses = await sql`
    SELECT code, name, level, credits, area, prereqs, coreqs
    FROM courses
    ORDER BY level ASC, name ASC
  `;

  let statuses: Record<string, string> = {};

  if (username) {
    const rows = await sql`
      SELECT ucs.course_code, ucs.status
      FROM user_course_status ucs
      JOIN users u ON u.id = ucs.user_id
      WHERE u.username = ${username}
    `;
    statuses = Object.fromEntries(rows.map((r) => [r.course_code, r.status]));
  }

  return NextResponse.json({ courses, statuses });
}
