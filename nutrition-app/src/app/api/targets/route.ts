import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";

export const runtime = "nodejs";

const createSchema = z.object({
  caloriesTarget: z.number().positive(),
  proteinTargetG: z.number().positive(),
  carbsTargetG: z.number().positive(),
  fatTargetG: z.number().positive(),
  goalBodyFatPct: z.number().nullable().optional(),
  goalWeightKg: z.number().nullable().optional(),
});

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getDefaultUser();
  const target = await prisma.nutritionTarget.findFirst({
    where: { userId: user.id, active: true },
    orderBy: { effectiveFrom: "desc" },
  });
  return NextResponse.json({ target });
}

// Replaces the active target: deactivates any previous one and creates a new row,
// so target history is preserved rather than overwritten.
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.message }, { status: 400 });
  }
  const data = body.data;
  const user = await getDefaultUser();

  const target = await prisma.$transaction(async (tx) => {
    await tx.nutritionTarget.updateMany({
      where: { userId: user.id, active: true },
      data: { active: false },
    });
    return tx.nutritionTarget.create({
      data: {
        userId: user.id,
        caloriesTarget: Math.round(data.caloriesTarget),
        proteinTargetG: data.proteinTargetG,
        carbsTargetG: data.carbsTargetG,
        fatTargetG: data.fatTargetG,
        goalBodyFatPct: data.goalBodyFatPct ?? null,
        goalWeightKg: data.goalWeightKg ?? null,
        active: true,
      },
    });
  });

  return NextResponse.json({ target }, { status: 201 });
}
