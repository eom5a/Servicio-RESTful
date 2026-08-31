import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getDefaultUser } from "@/lib/user";
import { saveUploadedImage } from "@/lib/storage";

export const runtime = "nodejs";

const createSchema = z.object({
  description: z.string().nullable().optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).nullable().optional(),
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  fiberG: z.number().nullable().optional(),
  eatenAt: z.string().datetime().optional(),
  photoBase64: z.string().nullable().optional(),
  rawAiResponse: z.unknown().optional(),
  aiConfidence: z.number().nullable().optional(),
  isEdited: z.boolean().optional(),
});

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getDefaultUser();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const limit = Number(searchParams.get("limit") ?? "100");

  const entries = await prisma.mealEntry.findMany({
    where: { userId: user.id, ...(from ? { eatenAt: { gte: new Date(from) } } : {}) },
    orderBy: { eatenAt: "desc" },
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

  let photoUrl: string | null = null;
  if (data.photoBase64) {
    photoUrl = await saveUploadedImage(Buffer.from(data.photoBase64, "base64"));
  }

  const entry = await prisma.mealEntry.create({
    data: {
      userId: user.id,
      description: data.description ?? null,
      mealType: data.mealType ?? null,
      calories: Math.round(data.calories),
      proteinG: data.proteinG,
      carbsG: data.carbsG,
      fatG: data.fatG,
      fiberG: data.fiberG ?? null,
      eatenAt: data.eatenAt ? new Date(data.eatenAt) : new Date(),
      photoUrl,
      rawAiResponse: data.rawAiResponse ? JSON.stringify(data.rawAiResponse) : null,
      aiConfidence: data.aiConfidence ?? null,
      isEdited: data.isEdited ?? false,
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
