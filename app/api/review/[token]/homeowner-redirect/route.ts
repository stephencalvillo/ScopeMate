import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { REVIEW_SESSION_COOKIE } from "@/lib/contractor/constants";
import { getHomeownerReviewRedirect } from "@/lib/contractor/review-homeowner-redirect";
import { reviewSessionCookieOptions } from "@/lib/contractor/review-session";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const redirectPath = await getHomeownerReviewRedirect(token);

    const response = NextResponse.json({ redirect: redirectPath });

    if (redirectPath) {
      response.cookies.set({
        name: REVIEW_SESSION_COOKIE,
        value: "",
        ...reviewSessionCookieOptions(),
        maxAge: 0,
      });
    }

    return response;
  } catch (error) {
    return jsonError(error);
  }
}
