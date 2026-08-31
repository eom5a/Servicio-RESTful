import "server-only";
import { generateStructuredJson } from "@/lib/gemini/client";
import { exerciseResponseSchema, exerciseZodSchema, type ExerciseResult } from "@/lib/gemini/schemas";

const BASE_PROMPT = `You are extracting a single exercise/activity log entry from a Google Health
or Google Fit export (either pasted text or a screenshot). Identify the activity type, its
duration in minutes, and calories burned. Set "confidence" between 0 and 1.`;

export async function analyzeExerciseReport(input: { text?: string; image?: { data: Buffer; mimeType: string } }): Promise<ExerciseResult> {
  const prompt = input.text ? `${BASE_PROMPT}\n\nReport text:\n${input.text}` : BASE_PROMPT;

  return generateStructuredJson({
    prompt,
    image: input.image,
    responseSchema: exerciseResponseSchema,
    zodSchema: exerciseZodSchema,
  });
}
