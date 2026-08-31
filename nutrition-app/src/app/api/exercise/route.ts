import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";

export const runtime = "nodejs";

const createSchema = z.object({
  type: z.string().min(1),
  durationMin: z.number().nullable().optional(),
  caloriesBurned: z.number().nullable().optional(),
  performedAt: z.string().datetime().optional(),
  rawReportText: z.string().nullable().optional(),
  rawAiResponse: z.unknown().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getDefaultUser();
  const limit = Number(new URL(request.url).searchParams.get("limit") ?? "100");

  const entries = await prisma.exerciseEntry.findMany({
    where: { userId: user.id },
    orderBy: { performedAt: "desc" },
    take: Math.min(limit, 500),
  });
  return NextResponse.json({ entries });
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

  const entry = await prisma.exerciseEntry.create({
    data: {
      userId: user.id,
      type: data.type,
      durationMin: data.durationMin ?? null,
      caloriesBurned: data.caloriesBurned ?? null,
      performedAt: data.performedAt ? new Date(data.performedAt) : new Date(),
      rawReportText: data.rawReportText ?? null,
      rawAiResponse: data.rawAiResponse ? JSON.stringify(data.rawAiResponse) : null,
      notes: data.notes ?? null,
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
