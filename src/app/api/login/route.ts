import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function normalize(username: string) {
  return username.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const raw = body?.username;

  if (typeof raw !== "string" || normalize(raw).length < 2) {
    return NextResponse.json(
      { error: "El nombre de usuario debe tener al menos 2 caracteres." },
      { status: 400 }
    );
  }

  const username = normalize(raw);

  const rows = await sql`
    INSERT INTO users (username)
    VALUES (${username})
    ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
    RETURNING id, username
  `;

  return NextResponse.json({ user: rows[0] });
}
