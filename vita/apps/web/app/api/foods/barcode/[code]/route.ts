import { NextResponse } from "next/server";
import { getFoodByBarcode } from "@vita/integrations";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const result = await getFoodByBarcode(code);
  if (!result) {
    return NextResponse.json(
      { error: "No se ha encontrado ningún alimento con ese código de barras" },
      { status: 404 },
    );
  }
  return NextResponse.json({ result });
}
