import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import {
  completeContractorReview,
  getHomeownerForProject,
} from "@/lib/contractor/suggestions";

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const { project } = await getReviewProjectByInvitationToken(token);
    const homeowner = await getHomeownerForProject(project.id);
    const result = await completeContractorReview({
      token,
      homeowner,
      project,
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
