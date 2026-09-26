import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@vita/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, db: "up" });
  } catch (error) {
    console.error("Health check: fallo de conexión a la base de datos", error);
    return NextResponse.json(
      { ok: false, db: "down" },
      { status: 503 },
    );
  }
}
