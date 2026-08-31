import "server-only";
import { GoogleGenAI, type Schema } from "@google/genai";
import type { ZodType } from "zod";

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to .env before using AI analysis features.",
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

type ImagePart = { data: Buffer; mimeType: string };

/**
 * Calls Gemini with a text prompt (and optionally an image), constrained to a JSON
 * response matching `responseSchema`, then validates the parsed JSON against `zodSchema`
 * so a malformed AI response fails loudly instead of silently corrupting saved data.
 */
export async function generateStructuredJson<T>(params: {
  prompt: string;
  image?: ImagePart;
  responseSchema: Schema;
  zodSchema: ZodType<T>;
}): Promise<T> {
  const { prompt, image, responseSchema, zodSchema } = params;

  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
    { text: prompt },
  ];
  if (image) {
    parts.push({
      inlineData: { data: image.data.toString("base64"), mimeType: image.mimeType },
    });
  }

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Gemini response was not valid JSON: ${text.slice(0, 200)}`);
  }

  const result = zodSchema.safeParse(json);
  if (!result.success) {
    throw new Error(`Gemini response did not match expected schema: ${result.error.message}`);
  }

  return result.data;
}
