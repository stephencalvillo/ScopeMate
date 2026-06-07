import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { assertReviewEditor } from "@/lib/contractor/review-access";
import {
  createDraftSuggestion,
  listDraftSuggestionsForInvitation,
} from "@/lib/contractor/suggestions";
import { getInvitationByToken } from "@/lib/contractor/invitations";
import { createSuggestionSchema } from "@/lib/validators/suggestion";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const invitation = await getInvitationByToken(token);
    const suggestions = await listDraftSuggestionsForInvitation(invitation.id);
    return NextResponse.json({ suggestions });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    await assertReviewEditor(token);
    const body = await request.json();
    const input = createSuggestionSchema.parse(body);

    const suggestion = await createDraftSuggestion({
      token,
      payload: input,
    });

    return NextResponse.json({ suggestion }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
