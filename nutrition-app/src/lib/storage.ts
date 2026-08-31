import "server-only";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, readFile, writeFile } from "fs/promises";

const UPLOADS_DIR = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.UPLOADS_DIR ?? "./storage/uploads",
);

/**
 * Saves a processed image buffer to local disk and returns the URL to fetch it back
 * (served through /api/uploads/[...path], which is auth-gated).
 * Swap this implementation for S3/R2 later without touching callers.
 */
export async function saveUploadedImage(buffer: Buffer, extension = "jpg") {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(/* turbopackIgnore: true */ UPLOADS_DIR, filename), buffer);
  return `/api/uploads/${filename}`;
}

export async function readUploadedFile(filename: string) {
  const safeName = path.basename(filename);
  return readFile(path.join(/* turbopackIgnore: true */ UPLOADS_DIR, safeName));
}
