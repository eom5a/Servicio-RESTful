import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasValidSession } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];

// Optimistic check only — real enforcement happens via requireSession()/isAuthenticated()
// in pages and route handlers. See Next.js auth guide: proxy should not be the only gate.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const authenticated = await hasValidSession();

  if (!isPublic && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
