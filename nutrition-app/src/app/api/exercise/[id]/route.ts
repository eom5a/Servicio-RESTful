import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/dal";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/exercise/[id]">) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await prisma.exerciseEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
