import "server-only";
import { generateStructuredJson } from "@/lib/gemini/client";
import { bodyMetricsResponseSchema, bodyMetricsZodSchema, type BodyMetricsResult } from "@/lib/gemini/schemas";

const PROMPT = `You are reading a screenshot from the Fitdays smart scale app (body composition scale).
Extract the body composition reading shown. Weight is required; leave any other field null if it
is not visible in the screenshot rather than guessing. Set "confidence" between 0 and 1 based on how
legible the numbers were. If anything is ambiguous, mention it in "notes".`;

export async function analyzeBodyMetricsPhoto(image: Buffer, mimeType: string): Promise<BodyMetricsResult> {
  return generateStructuredJson({
    prompt: PROMPT,
    image: { data: image, mimeType },
    responseSchema: bodyMetricsResponseSchema,
    zodSchema: bodyMetricsZodSchema,
  });
}
