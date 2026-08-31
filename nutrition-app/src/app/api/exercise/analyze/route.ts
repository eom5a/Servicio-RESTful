import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/dal";
import { prepareImage } from "@/lib/image";
import { analyzeExerciseReport } from "@/lib/gemini/exercise";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const text = formData.get("text");
  const file = formData.get("photo");

  if (typeof text !== "string" && !(file instanceof File)) {
    return NextResponse.json({ error: "Provide report text or a screenshot" }, { status: 400 });
  }

  let image: { data: Buffer; mimeType: string } | undefined;
  let photoBase64: string | undefined;
  if (file instanceof File) {
    const original = Buffer.from(await file.arrayBuffer());
    const prepared = await prepareImage(original);
    image = { data: prepared.buffer, mimeType: prepared.mimeType };
    photoBase64 = prepared.buffer.toString("base64");
  }

  try {
    const result = await analyzeExerciseReport({
      text: typeof text === "string" && text.trim() ? text : undefined,
      image,
    });
    return NextResponse.json({ result, photoBase64 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 502 },
    );
  }
}
