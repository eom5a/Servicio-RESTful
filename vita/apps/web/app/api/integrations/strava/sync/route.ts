import { NextResponse } from "next/server";
import { syncRecentActivities } from "@vita/integrations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const days = Number(new URL(request.url).searchParams.get("days") ?? "30");
  try {
    const result = await syncRecentActivities(days);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error sincronizando" },
      { status: 400 },
    );
  }
}
