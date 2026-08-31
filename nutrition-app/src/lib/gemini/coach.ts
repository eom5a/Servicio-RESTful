import "server-only";
import { generateStructuredJson } from "@/lib/gemini/client";
import { coachResponseSchema, coachZodSchema, type CoachResult } from "@/lib/gemini/schemas";

export type CoachInput = {
  goalBodyFatPct?: number | null;
  goalWeightKg?: number | null;
  target: { calories: number; proteinG: number; carbsG: number; fatG: number } | null;
  days: Array<{
    date: string;
    weightKg?: number;
    bodyFatPercent?: number;
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    caloriesBurned?: number;
    workedOut?: boolean;
  }>;
};

const PROMPT_PREFIX = `You are a supportive, no-nonsense nutrition and fitness coach. Analyze the
last several days of a user's weight/body-fat trend, meal macros vs their targets, exercise, and
gym adherence. Write a short, encouraging but honest "summary" (2-4 sentences), plus 2-4 concrete
"highlights" (short, actionable bullets — e.g. what to adjust tomorrow). Do not repeat raw numbers
verbatim unless they matter for the point you're making.

Here is the structured data for the period:
`;

export async function generateDailyCoachNote(input: CoachInput): Promise<CoachResult> {
  const prompt = `${PROMPT_PREFIX}${JSON.stringify(input, null, 2)}`;

  return generateStructuredJson({
    prompt,
    responseSchema: coachResponseSchema,
    zodSchema: coachZodSchema,
  });
}
