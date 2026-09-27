import { NextResponse } from "next/server";
import { connectStrava } from "@vita/integrations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/integraciones?strava_error=${encodeURIComponent(error)}`, url),
    );
  }
  if (!code) {
    return NextResponse.json({ error: "Falta el parámetro 'code'" }, { status: 400 });
  }

  await connectStrava(code);
  return NextResponse.redirect(new URL("/integraciones?strava=ok", url));
}
