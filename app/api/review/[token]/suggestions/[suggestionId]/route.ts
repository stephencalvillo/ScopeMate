import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { assertReviewEditor } from "@/lib/contractor/review-access";
import {
  updateDraftSuggestion,
  withdrawDraftSuggestion,
} from "@/lib/contractor/suggestions";
import { updateSuggestionSchema } from "@/lib/validators/suggestion";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ token: string; suggestionId: string }> }
) {
  try {
    const { token, suggestionId } = await context.params;
    await assertReviewEditor(token, request);
    const body = await request.json();
    const input = updateSuggestionSchema.parse(body);

    const suggestion = await updateDraftSuggestion({
      token,
      suggestionId,
      payload: input,
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ token: string; suggestionId: string }> }
) {
  try {
    const { token, suggestionId } = await context.params;
    await assertReviewEditor(token, request);
    const suggestion = await withdrawDraftSuggestion(token, suggestionId);
    return NextResponse.json({ suggestion });
  } catch (error) {
    return jsonError(error);
  }
}
