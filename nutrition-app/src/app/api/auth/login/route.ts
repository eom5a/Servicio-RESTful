import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { passcode } = await request.json().catch(() => ({ passcode: "" }));

  const expected = process.env.APP_PASSCODE;
  if (!expected) {
    return NextResponse.json({ error: "APP_PASSCODE is not configured" }, { status: 500 });
  }

  if (typeof passcode !== "string" || passcode !== expected) {
    return NextResponse.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
