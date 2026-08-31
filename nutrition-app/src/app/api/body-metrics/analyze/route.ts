import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/dal";
import { prepareImage } from "@/lib/image";
import { analyzeBodyMetricsPhoto } from "@/lib/gemini/bodyMetrics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing photo" }, { status: 400 });
  }

  const original = Buffer.from(await file.arrayBuffer());
  const { buffer, mimeType } = await prepareImage(original);

  try {
    const result = await analyzeBodyMetricsPhoto(buffer, mimeType);
    return NextResponse.json({ result, photoBase64: buffer.toString("base64") });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 502 },
    );
  }
}
