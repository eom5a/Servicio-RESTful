import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";

export const runtime = "nodejs";

const setSchema = z.object({
  exerciseName: z.string().min(1),
  setNumber: z.number().int().positive(),
  weightKg: z.number().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  rpe: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const createSchema = z.object({
  date: z.string().datetime().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(setSchema).min(1),
});

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getDefaultUser();
  const { searchParams } = new URL(request.url);
  const exerciseName = searchParams.get("exerciseName");
  const limit = Number(searchParams.get("limit") ?? "50");

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId: user.id,
      ...(exerciseName ? { sets: { some: { exerciseName } } } : {}),
    },
    orderBy: { date: "desc" },
    take: Math.min(limit, 200),
    include: { sets: true },
  });

  return NextResponse.json({ sessions });
}

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

  const session = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      date: data.date ? new Date(data.date) : new Date(),
      notes: data.notes ?? null,
      sets: {
        create: data.sets.map((s) => ({
          exerciseName: s.exerciseName,
          setNumber: s.setNumber,
          weightKg: s.weightKg ?? null,
          reps: s.reps ?? null,
          rpe: s.rpe ?? null,
          notes: s.notes ?? null,
        })),
      },
    },
    include: { sets: true },
  });

  return NextResponse.json({ session }, { status: 201 });
}
