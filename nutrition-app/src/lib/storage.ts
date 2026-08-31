import "server-only";
import { randomUUID } from "crypto";
import { put, get } from "@vercel/blob";

/**
 * Saves a processed image buffer to Vercel Blob (private — not reachable by public URL)
 * and returns the URL to fetch it back through /api/uploads/[...path], which is auth-gated.
 */
export async function saveUploadedImage(buffer: Buffer, extension = "jpg") {
  const blob = await put(`${randomUUID()}.${extension}`, buffer, {
    access: "private",
    contentType: extension === "jpg" ? "image/jpeg" : `image/${extension}`,
  });
  return `/api/uploads/${blob.pathname}`;
}

export async function readUploadedFile(pathname: string) {
  const result = await get(pathname, { access: "private" });
  if (!result || !result.stream) {
    throw new Error("Not found");
  }
  return Buffer.from(await new Response(result.stream).arrayBuffer());
}
