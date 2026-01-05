import { NextResponse } from "next/server";
import { findUserByUsername } from "@/lib/users-store";

export async function GET() {
  const user = await findUserByUsername("gmengarelli");
  return NextResponse.json({ ok: true, user });
}
