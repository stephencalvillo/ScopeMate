import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { assertReviewEditor } from "@/lib/contractor/review-access";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import {
  completeContractorReview,
  getHomeownerForProject,
} from "@/lib/contractor/suggestions";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    await assertReviewEditor(token, request);
    const { project } = await getReviewProjectByInvitationToken(token);
    const homeowner = await getHomeownerForProject(project.id);
    const result = await completeContractorReview({
      token,
      homeowner,
      project,
      request,
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
