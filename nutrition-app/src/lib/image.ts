import "server-only";
import sharp from "sharp";

/**
 * Resizes/compresses an uploaded photo before it goes anywhere (Gemini or disk):
 * keeps Gemini image-token cost down and caps disk usage for saved originals.
 */
export async function prepareImage(input: Buffer) {
  const jpeg = await sharp(input)
    .rotate() // apply EXIF orientation, then strip it
    .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
  return { buffer: jpeg, mimeType: "image/jpeg" as const, extension: "jpg" };
}
