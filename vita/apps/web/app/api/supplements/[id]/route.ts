import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, supplements } from "@vita/db";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  endDate: z.string().date().nullable().optional(),
  dose: z.number().positive().nullable().optional(),
  schedule: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Solicitud inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { dose, ...rest } = parsed.data;
  const [row] = await db
    .update(supplements)
    .set({ ...rest, ...(dose !== undefined ? { dose: dose !== null ? String(dose) : null } : {}) })
    .where(eq(supplements.id, id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ result: row });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await db.delete(supplements).where(eq(supplements.id, id));
  return NextResponse.json({ ok: true });
}
