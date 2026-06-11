import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { assertReviewEditor } from "@/lib/contractor/review-access";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import {
  getHomeownerForProject,
  respondToSuggestionFollowUp,
} from "@/lib/contractor/suggestions";
import { followUpMessageSchema } from "@/lib/validators/suggestion";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string; suggestionId: string }> }
) {
  try {
    const { token, suggestionId } = await context.params;
    await assertReviewEditor(token, request);
    const body = await request.json();
    const input = followUpMessageSchema.parse(body);
    const { project } = await getReviewProjectByInvitationToken(token);
    const homeowner = await getHomeownerForProject(project.id);

    const suggestion = await respondToSuggestionFollowUp({
      token,
      suggestionId,
      message: input.message,
      homeowner,
      project,
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    return jsonError(error);
  }
}
