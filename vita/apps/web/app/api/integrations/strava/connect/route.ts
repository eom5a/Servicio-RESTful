import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@vita/integrations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const redirectUri = new URL(
    "/api/integrations/strava/callback",
    request.url,
  ).toString();
  return NextResponse.redirect(buildAuthorizeUrl(redirectUri));
}
