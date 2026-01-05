import { NextResponse } from "next/server";
import { findUserByUsername } from "@/lib/users-store";

export async function GET() {
  const user = await findUserByUsername("gmengarelli");

  if (!user) {
    return NextResponse.json({ ok: true, found: false, user: null });
  }

  // No devolvemos el hash completo por seguridad
  const hash = String(user.password_hash ?? "");
  return NextResponse.json({
    ok: true,
    found: true,
    username: user.username,
    role: user.role,
    active: user.active,
    password_hash_length: hash.length,
    password_hash_starts_with: hash.slice(0, 4), // debería ser "$2a$" o "$2b$"
  });
}
