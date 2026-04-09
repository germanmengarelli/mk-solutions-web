import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimitLogin } from "@/lib/rate-limit";

export const runtime = "nodejs";

const DOMO_API_URL = process.env.DOMO_API_URL || "http://localhost:3000";

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

    // Enviar al backend DOMO como lead
    const res = await fetch(`${DOMO_API_URL}/api/contacto-web`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa, contacto, email, necesidad }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Error del servidor" }));
      return NextResponse.json(
        { ok: false, error: (err as any).error ?? "Error al enviar" },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? "Error servidor";
    const status = /rate|limit|429|too many/i.test(msg) ? 429 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
