import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { ForbiddenError } from "@/lib/auth/clerk";
import { assertReviewEditor } from "@/lib/contractor/review-access";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import { generateDraftEstimateForReview } from "@/lib/ai/generate-estimate";
import { estimateIsEditable, getEstimateForReview } from "@/lib/estimates/estimates";

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    await assertReviewEditor(token);
    const { review, project } = await getReviewProjectByInvitationToken(token);
    if (review.status !== "in_progress") {
      throw new ForbiddenError("This review is no longer editable.");
    }
    const existing = await getEstimateForReview(review.id);

    if (existing && !estimateIsEditable(existing)) {
      throw new ForbiddenError("This proposal has already been submitted.");
    }

    const estimate = await generateDraftEstimateForReview({ review, project });
    return NextResponse.json({ estimate });
  } catch (error) {
    return jsonError(error);
  }
}
