import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE, sessionCookieMaxAgeSeconds } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

const bodySchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const ok = await verifyPassword(parsed.data.password);
  if (!ok) {
    return NextResponse.json(
      { error: "Contraseña incorrecta" },
      { status: 401 },
    );
  }

  const email = process.env.AUTH_USER_EMAIL ?? "enric@vita.local";
  const token = await createSessionToken(email);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionCookieMaxAgeSeconds(),
  });
  return response;
}
