import bcrypt from "bcryptjs";

/** Compara una contraseña en claro contra el hash bcrypt de AUTH_PASSWORD_HASH. */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.AUTH_PASSWORD_HASH;
  if (!hash) {
    throw new Error("AUTH_PASSWORD_HASH no está definida (ver .env.example)");
  }
  return bcrypt.compare(password, hash);
}
