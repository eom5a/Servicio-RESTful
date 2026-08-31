import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecretKey() {
  const secret = process.env.APP_SESSION_SECRET;
  if (!secret) {
    throw new Error("APP_SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

async function encrypt(payload: { authenticated: true }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_MS / 1000}s`)
    .sign(getSecretKey());
}

async function decrypt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload.authenticated === true ? payload : null;
  } catch {
    return null;
  }
}

export async function createSession() {
  const token = await encrypt({ authenticated: true });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** True if the request carries a validly signed session cookie. */
export async function hasValidSession() {
  const cookieStore = await cookies();
  const payload = await decrypt(cookieStore.get(COOKIE_NAME)?.value);
  return payload !== null;
}
