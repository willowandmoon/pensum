import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Escribe tu correo y tu contraseña." },
      { status: 400 }
    );
  }

  const rows = await sql`
    SELECT email, name, career, password_hash, current_semester
    FROM users
    WHERE email = ${email}
  `;

  const user = rows[0];
  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      email: user.email,
      name: user.name,
      career: user.career,
      currentSemester: user.current_semester,
    },
  });
}
