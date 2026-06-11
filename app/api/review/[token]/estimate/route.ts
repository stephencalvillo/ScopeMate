import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { ForbiddenError } from "@/lib/auth/clerk";
import { assertReviewEditor } from "@/lib/contractor/review-access";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import {
  estimateIsEditable,
  getEstimateForReview,
  saveEstimateLineItems,
} from "@/lib/estimates/estimates";
import { saveEstimateSchema } from "@/lib/validators/estimate";

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const { review } = await getReviewProjectByInvitationToken(token, request);
    const estimate = await getEstimateForReview(review.id);

    return NextResponse.json({ estimate });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    await assertReviewEditor(token, request);
    const { review } = await getReviewProjectByInvitationToken(token, request);
    if (review.status !== "in_progress") {
      throw new ForbiddenError("This review is no longer editable.");
    }
    const body = await request.json();
    const input = saveEstimateSchema.parse(body);
    const estimate = await saveEstimateLineItems({
      review,
      lineItems: input.line_items,
    });

    return NextResponse.json({ estimate });
  } catch (error) {
    return jsonError(error);
  }
}
