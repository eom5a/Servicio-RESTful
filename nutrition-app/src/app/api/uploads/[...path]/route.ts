import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/dal";
import { readUploadedFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: RouteContext<"/api/uploads/[...path]">) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: segments } = await ctx.params;
  const pathname = segments.join("/");

  try {
    const buffer = await readUploadedFile(pathname);
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=31536000" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
