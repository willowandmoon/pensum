import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim().toLowerCase();

  const courses = await sql`
    SELECT code, name, level, credits, area, prereqs
    FROM courses
    ORDER BY level ASC, name ASC
  `;

  let statuses: Record<string, string> = {};

  if (username) {
    const rows = await sql`
      SELECT c.code, c.status
      FROM user_course_status c
      JOIN users u ON u.id = c.user_id
      WHERE u.username = ${username}
    `;
    statuses = Object.fromEntries(rows.map((r) => [r.code, r.status]));
  }

  return NextResponse.json({ courses, statuses });
}
