import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: Request) {
  const url = new URL(req.url);

  // Solo protegemos /crm
  if (!url.pathname.startsWith("/crm")) {
    return NextResponse.next();
  }

  // Auth.js v5 uses "authjs" cookie prefix instead of "next-auth"
  const token = await getToken({
    req: req as any,
    secret: process.env.AUTH_SECRET,
    cookieName: "__Secure-authjs.session-token",
  });

  // Si no hay token, mandamos a /login
  if (!token) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*"],
};
