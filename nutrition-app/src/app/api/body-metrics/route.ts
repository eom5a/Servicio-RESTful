import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";
import { saveUploadedImage } from "@/lib/storage";

export const runtime = "nodejs";

const createSchema = z.object({
  weightKg: z.number().positive(),
  bodyFatPercent: z.number().nullable().optional(),
  muscleMassKg: z.number().nullable().optional(),
  waterPercent: z.number().nullable().optional(),
  visceralFat: z.number().nullable().optional(),
  boneMassKg: z.number().nullable().optional(),
  bmr: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  recordedAt: z.string().datetime().optional(),
  photoBase64: z.string().nullable().optional(),
  rawAiResponse: z.unknown().optional(),
  aiConfidence: z.number().nullable().optional(),
});

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getDefaultUser();
  const limit = Number(new URL(request.url).searchParams.get("limit") ?? "90");

  const entries = await prisma.bodyMetricEntry.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    take: Math.min(limit, 365),
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

  let sourceImageUrl: string | null = null;
  if (data.photoBase64) {
    sourceImageUrl = await saveUploadedImage(Buffer.from(data.photoBase64, "base64"));
  }

  const entry = await prisma.bodyMetricEntry.create({
    data: {
      userId: user.id,
      weightKg: data.weightKg,
      bodyFatPercent: data.bodyFatPercent ?? null,
      muscleMassKg: data.muscleMassKg ?? null,
      waterPercent: data.waterPercent ?? null,
      visceralFat: data.visceralFat ?? null,
      boneMassKg: data.boneMassKg ?? null,
      bmr: data.bmr ?? null,
      notes: data.notes ?? null,
      recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
      sourceImageUrl,
      rawAiResponse: data.rawAiResponse ? JSON.stringify(data.rawAiResponse) : null,
      aiConfidence: data.aiConfidence ?? null,
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
