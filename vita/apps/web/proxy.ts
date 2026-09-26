import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protege todo excepto: /login, /api/auth/*, /api/health, assets
     * estáticos de Next y el manifiesto/iconos de la PWA (Fase 4).
     */
    "/((?!login|api/auth|api/health|_next/static|_next/image|favicon.ico).*)",
  ],
};
