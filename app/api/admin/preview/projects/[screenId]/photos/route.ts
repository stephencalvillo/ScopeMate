import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/admin";
import { previewHomeownerPhotos } from "@/lib/admin/fixtures";
import { getScreenById } from "@/lib/admin/screen-catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function GET(
  request: Request,
  { params }: { params: Promise<{ screenId: string }> }
) {
  try {
    await requireAdmin(request);
    const { screenId } = await params;
    const screen = getScreenById(screenId);

    if (screen?.id !== "homeowner-project-detail") {
      return NextResponse.json({ error: "Preview not found." }, { status: 404 });
    }

    const filled = new URL(request.url).searchParams.get("filled") === "1";

    return NextResponse.json(
      { photos: filled ? previewHomeownerPhotos : [] },
      { headers: noStoreHeaders }
    );
  } catch (error) {
    const response = jsonError(error);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
