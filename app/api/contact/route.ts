import { NextResponse } from "next/server";
import { z } from "zod";

import { rateLimitLogin } from "@/lib/rate-limit";
import { appendRow } from "@/lib/sheets";

export const runtime = "nodejs";

const ContactSchema = z.object({
  empresa: z.string().min(2, "Empresa requerida").max(120),
  contacto: z.string().min(2, "Contacto requerido").max(120),
  email: z.string().email("Email inválido").max(180),
  necesidad: z.string().min(5, "Contá un poco más").max(1200),
  website: z.string().optional(), // honeypot
});

function getIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    const ua = req.headers.get("user-agent") ?? "";

    // ✅ Anti-spam: reutilizamos tu rate limit (según tu lib pide 2 args)
    await rateLimitLogin(req as any, ip);

    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues?.[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const { empresa, contacto, email, necesidad, website } = parsed.data;

    // Honeypot: si viene lleno => bot
    if (website && website.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const created_at = new Date().toISOString();

    await appendRow("WebContacts", [
      created_at,
      empresa,
      contacto,
      email,
      necesidad,
      "web",
      ip,
      ua,
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // Si tu rateLimitLogin lanza error cuando se pasa de límite, caemos acá.
    // Devolvemos 429 si detectamos algo típico, sino 500.
    const msg = e?.message ?? "Error servidor";
    const status = /rate|limit|429|too many/i.test(msg) ? 429 : 500;

    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
