import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "vita_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET no está definida (ver .env.example)");
  }
  return new TextEncoder().encode(secret);
}

function getSessionDays(): number {
  const raw = process.env.AUTH_SESSION_DAYS;
  const days = raw ? Number.parseInt(raw, 10) : 90;
  return Number.isFinite(days) && days > 0 ? days : 90;
}

export type SessionPayload = {
  email: string;
};

/** Firma un JWT de sesión de larga duración para el único usuario de la app. */
export async function createSessionToken(email: string): Promise<string> {
  const days = getSessionDays();
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(getSecretKey());
}

/** Verifica un JWT de sesión. Devuelve `null` si es inválido o ha expirado. */
export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export function sessionCookieMaxAgeSeconds(): number {
  return getSessionDays() * 24 * 60 * 60;
}
