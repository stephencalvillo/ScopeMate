import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/admin";
import { previewContractorRates } from "@/lib/admin/fixtures";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    return NextResponse.json(
      { rates: previewContractorRates },
      { headers: noStoreHeaders }
    );
  } catch (error) {
    const response = jsonError(error);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
