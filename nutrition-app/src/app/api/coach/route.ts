import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";
import { generateDailyCoachNote, type CoachInput } from "@/lib/gemini/coach";

export const runtime = "nodejs";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getDefaultUser();
  const limit = Number(new URL(request.url).searchParams.get("limit") ?? "10");
  const notes = await prisma.dailyCoachNote.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: Math.min(limit, 50),
  });
  return NextResponse.json({ notes });
}

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getDefaultUser();

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [bodyMetrics, meals, exerciseEntries, workouts, target] = await Promise.all([
    prisma.bodyMetricEntry.findMany({ where: { userId: user.id, recordedAt: { gte: since } }, orderBy: { recordedAt: "asc" } }),
    prisma.mealEntry.findMany({ where: { userId: user.id, eatenAt: { gte: since } }, orderBy: { eatenAt: "asc" } }),
    prisma.exerciseEntry.findMany({ where: { userId: user.id, performedAt: { gte: since } }, orderBy: { performedAt: "asc" } }),
    prisma.workoutSession.findMany({ where: { userId: user.id, date: { gte: since } } }),
    prisma.nutritionTarget.findFirst({ where: { userId: user.id, active: true } }),
  ]);

  const byDay = new Map<string, CoachInput["days"][number]>();
  const ensureDay = (date: Date) => {
    const key = dayKey(date);
    if (!byDay.has(key)) byDay.set(key, { date: key });
    return byDay.get(key)!;
  };

  for (const m of bodyMetrics) {
    const day = ensureDay(m.recordedAt);
    day.weightKg = m.weightKg;
    if (m.bodyFatPercent != null) day.bodyFatPercent = m.bodyFatPercent;
  }
  for (const meal of meals) {
    const day = ensureDay(meal.eatenAt);
    day.calories = (day.calories ?? 0) + meal.calories;
    day.proteinG = (day.proteinG ?? 0) + meal.proteinG;
    day.carbsG = (day.carbsG ?? 0) + meal.carbsG;
    day.fatG = (day.fatG ?? 0) + meal.fatG;
  }
  for (const ex of exerciseEntries) {
    const day = ensureDay(ex.performedAt);
    day.caloriesBurned = (day.caloriesBurned ?? 0) + (ex.caloriesBurned ?? 0);
  }
  for (const w of workouts) {
    ensureDay(w.date).workedOut = true;
  }

  const input: CoachInput = {
    goalBodyFatPct: target?.goalBodyFatPct ?? null,
    goalWeightKg: target?.goalWeightKg ?? null,
    target: target
      ? {
          calories: target.caloriesTarget,
          proteinG: target.proteinTargetG,
          carbsG: target.carbsTargetG,
          fatG: target.fatTargetG,
        }
      : null,
    days: Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };

  try {
    const result = await generateDailyCoachNote(input);
    const note = await prisma.dailyCoachNote.create({
      data: {
        userId: user.id,
        summary: result.summary,
        highlights: JSON.stringify(result.highlights),
        rawAiResponse: JSON.stringify(result),
      },
    });
    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Coach analysis failed" },
      { status: 502 },
    );
  }
}
