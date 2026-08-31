import "server-only";
import { generateStructuredJson } from "@/lib/gemini/client";
import { mealResponseSchema, mealZodSchema, type MealResult } from "@/lib/gemini/schemas";

const PROMPT = `You are a nutritionist estimating the macros of a meal from a photo. Identify the
foods present, estimate their portion sizes, and estimate total calories, protein, carbs, fat and
fiber for the whole plate. Break the total down by food item in "items". Be a careful, realistic
estimator — these numbers will be used to track someone's daily nutrition targets while losing fat,
so avoid both wild over- and under-estimates. Set "confidence" between 0 and 1.`;

export async function analyzeMealPhoto(image: Buffer, mimeType: string): Promise<MealResult> {
  return generateStructuredJson({
    prompt: PROMPT,
    image: { data: image, mimeType },
    responseSchema: mealResponseSchema,
    zodSchema: mealZodSchema,
  });
}
