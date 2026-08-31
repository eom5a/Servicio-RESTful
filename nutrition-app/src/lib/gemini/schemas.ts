import { Type, type Schema } from "@google/genai";
import { z } from "zod";

// ---------- Body composition (scale screenshot, e.g. Fitdays) ----------

export const bodyMetricsResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    weightKg: { type: Type.NUMBER, description: "Weight in kilograms" },
    bodyFatPercent: { type: Type.NUMBER, nullable: true },
    muscleMassKg: { type: Type.NUMBER, nullable: true },
    waterPercent: { type: Type.NUMBER, nullable: true },
    visceralFat: { type: Type.NUMBER, nullable: true },
    boneMassKg: { type: Type.NUMBER, nullable: true },
    bmr: { type: Type.INTEGER, nullable: true, description: "Basal metabolic rate in kcal" },
    confidence: { type: Type.NUMBER, description: "0 to 1, how legible/reliable the reading was" },
    notes: { type: Type.STRING, nullable: true, description: "Anything unclear or worth flagging" },
  },
  required: ["weightKg", "confidence"],
};

export const bodyMetricsZodSchema = z.object({
  weightKg: z.number(),
  bodyFatPercent: z.number().nullable().optional(),
  muscleMassKg: z.number().nullable().optional(),
  waterPercent: z.number().nullable().optional(),
  visceralFat: z.number().nullable().optional(),
  boneMassKg: z.number().nullable().optional(),
  bmr: z.number().nullable().optional(),
  confidence: z.number(),
  notes: z.string().nullable().optional(),
});

export type BodyMetricsResult = z.infer<typeof bodyMetricsZodSchema>;

// ---------- Meal photo -> macros ----------

export const mealResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING, description: "Short description of the meal" },
    mealType: {
      type: Type.STRING,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      nullable: true,
    },
    calories: { type: Type.INTEGER },
    proteinG: { type: Type.NUMBER },
    carbsG: { type: Type.NUMBER },
    fatG: { type: Type.NUMBER },
    fiberG: { type: Type.NUMBER, nullable: true },
    confidence: { type: Type.NUMBER, description: "0 to 1" },
    items: {
      type: Type.ARRAY,
      description: "Foods identified and their estimated contribution",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          estimatedGrams: { type: Type.NUMBER, nullable: true },
          calories: { type: Type.INTEGER, nullable: true },
        },
        required: ["name"],
      },
    },
  },
  required: ["description", "calories", "proteinG", "carbsG", "fatG", "confidence", "items"],
};

export const mealZodSchema = z.object({
  description: z.string(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).nullable().optional(),
  calories: z.number(),
  proteinG: z.number(),
  carbsG: z.number(),
  fatG: z.number(),
  fiberG: z.number().nullable().optional(),
  confidence: z.number(),
  items: z.array(
    z.object({
      name: z.string(),
      estimatedGrams: z.number().nullable().optional(),
      calories: z.number().nullable().optional(),
    }),
  ),
});

export type MealResult = z.infer<typeof mealZodSchema>;

// ---------- Exercise report (Google Health/Fit text or screenshot) ----------

export const exerciseResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, description: "e.g. running, cycling, walking, strength training" },
    durationMin: { type: Type.INTEGER, nullable: true },
    caloriesBurned: { type: Type.INTEGER, nullable: true },
    confidence: { type: Type.NUMBER },
    notes: { type: Type.STRING, nullable: true },
  },
  required: ["type", "confidence"],
};

export const exerciseZodSchema = z.object({
  type: z.string(),
  durationMin: z.number().nullable().optional(),
  caloriesBurned: z.number().nullable().optional(),
  confidence: z.number(),
  notes: z.string().nullable().optional(),
});

export type ExerciseResult = z.infer<typeof exerciseZodSchema>;

// ---------- Daily coach summary ----------

export const coachResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "2-4 sentence analysis of the day/week" },
    highlights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-4 short, actionable bullet points",
    },
  },
  required: ["summary", "highlights"],
};

export const coachZodSchema = z.object({
  summary: z.string(),
  highlights: z.array(z.string()),
});

export type CoachResult = z.infer<typeof coachZodSchema>;
