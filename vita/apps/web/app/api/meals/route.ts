import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db, meals, mealItems, foods } from "@vita/db";
import { resolveFoodCandidate, type FoodCandidate } from "@vita/integrations";

export const dynamic = "force-dynamic";

const foodCandidateSchema = z.union([
  z.object({
    origin: z.literal("local"),
    id: z.string().uuid(),
    name: z.string(),
    brand: z.string().nullable(),
    barcode: z.string().nullable(),
    kcal: z.number(),
    proteinG: z.number(),
    fatG: z.number(),
    carbsG: z.number(),
    fiberG: z.number().nullable(),
  }),
  z.object({
    origin: z.literal("openfoodfacts"),
    name: z.string(),
    brand: z.string().nullable(),
    barcode: z.string().nullable(),
    kcal: z.number(),
    proteinG: z.number(),
    fatG: z.number(),
    carbsG: z.number(),
    fiberG: z.number().nullable(),
  }),
]) satisfies z.ZodType<FoodCandidate>;

const createMealSchema = z.object({
  mealType: z.enum(["desayuno", "comida", "cena", "snack"]),
  ts: z.string().datetime().optional(),
  items: z
    .array(
      z.object({
        candidate: foodCandidateSchema,
        grams: z.number().positive(),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  const parsed = createMealSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Solicitud inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { mealType, ts, items } = parsed.data;

  const [meal] = await db
    .insert(meals)
    .values({ mealType, ts: ts ? new Date(ts) : new Date() })
    .returning();

  for (const item of items) {
    const food = await resolveFoodCandidate(item.candidate);
    await db.insert(mealItems).values({
      mealId: meal.id,
      foodId: food.id,
      grams: String(item.grams),
    });
  }

  return NextResponse.json({ ok: true, mealId: meal.id }, { status: 201 });
}

export async function GET(request: Request) {
  const dateParam = new URL(request.url).searchParams.get("date");
  const date = dateParam ?? new Date().toISOString().slice(0, 10);

  const rows = await db
    .select({
      mealId: meals.id,
      mealType: meals.mealType,
      ts: meals.ts,
      grams: mealItems.grams,
      foodName: foods.name,
      foodBrand: foods.brand,
      kcal: foods.kcal,
      proteinG: foods.proteinG,
      fatG: foods.fatG,
      carbsG: foods.carbsG,
    })
    .from(meals)
    .innerJoin(mealItems, eq(mealItems.mealId, meals.id))
    .innerJoin(foods, eq(foods.id, mealItems.foodId))
    .where(sql`${meals.ts}::date = ${date}::date`)
    .orderBy(meals.ts);

  return NextResponse.json({ date, items: rows });
}
