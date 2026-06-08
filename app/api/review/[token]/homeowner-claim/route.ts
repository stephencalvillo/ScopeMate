import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { claimContractorClientShareForHomeowner } from "@/lib/contractor/homeowner-share-link-claim";

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const user = await ensureUserRecord();
    const result = await claimContractorClientShareForHomeowner(token, user);

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
