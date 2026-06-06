import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { ForbiddenError } from "@/lib/auth/clerk";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import { submitEstimateForReview } from "@/lib/estimates/estimates";

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const { review } = await getReviewProjectByInvitationToken(token);
    if (review.status !== "in_progress") {
      throw new ForbiddenError("This review is no longer editable.");
    }
    const estimate = await submitEstimateForReview(review);

    return NextResponse.json({ estimate });
  } catch (error) {
    return jsonError(error);
  }
}
