import { NextResponse } from "next/server";
import { importFitdaysExport } from "@vita/integrations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Sube el archivo exportado desde la app Fitdays (campo 'file')" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await importFitdaysExport(buffer);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importando export de Fitdays:", error);
    return NextResponse.json(
      {
        error:
          "No se ha podido leer el archivo. ¿Es un export sin modificar de la app Fitdays?",
      },
      { status: 422 },
    );
  }
}
