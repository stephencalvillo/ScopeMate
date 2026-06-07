import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getHomeownerReviewRedirect } from "@/lib/contractor/review-homeowner-redirect";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const redirect = await getHomeownerReviewRedirect(token);

    return NextResponse.json({ redirect });
  } catch (error) {
    return jsonError(error);
  }
}
