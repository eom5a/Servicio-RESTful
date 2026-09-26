import { NextResponse } from "next/server";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { db, supplements, supplementKindEnum } from "@vita/db";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1),
  dose: z.number().positive().optional(),
  unit: z.string().optional(),
  schedule: z.string().optional(),
  startDate: z.string().date(),
  reason: z.string().optional(),
  kind: z.enum(supplementKindEnum.enumValues),
});

export async function GET() {
  const rows = await db
    .select()
    .from(supplements)
    .orderBy(desc(supplements.startDate));
  return NextResponse.json({ results: rows });
}

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Solicitud inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { dose, ...rest } = parsed.data;
  const [row] = await db
    .insert(supplements)
    .values({ ...rest, dose: dose !== undefined ? String(dose) : null })
    .returning();

  return NextResponse.json({ result: row }, { status: 201 });
}
