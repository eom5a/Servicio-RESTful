import { NextResponse } from "next/server";
import { searchFoods } from "@vita/integrations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "El parámetro 'q' debe tener al menos 2 caracteres" },
      { status: 400 },
    );
  }

  const results = await searchFoods(query);
  return NextResponse.json({ results });
}
