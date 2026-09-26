import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recomendado para GCM

function loadKey(): Buffer {
  const hex = process.env.APP_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error(
      "APP_ENCRYPTION_KEY no está definida. Generar con: openssl rand -hex 32",
    );
  }
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error(
      "APP_ENCRYPTION_KEY debe ser una cadena hex de 64 caracteres (32 bytes)",
    );
  }
  return key;
}

/**
 * Cifra un texto (p. ej. tokens OAuth de una integración) para guardarlo en
 * `integrations.encrypted_tokens`. Formato de salida: iv:authTag:ciphertext,
 * todo en base64.
 */
export function encryptSecret(plaintext: string): string {
  const key = loadKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext]
    .map((buf) => buf.toString("base64"))
    .join(":");
}

export function decryptSecret(payload: string): string {
  const key = loadKey();
  const [ivB64, authTagB64, ciphertextB64] = payload.split(":");
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error("Formato de secreto cifrado inválido");
  }
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
