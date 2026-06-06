import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { parseContractorScopeAddition } from "@/lib/ai/parse-contractor-scope-addition";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import { createDraftSuggestion } from "@/lib/contractor/suggestions";
import { generateAddSuggestionSchema } from "@/lib/validators/suggestion";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const body = await request.json();
    const input = generateAddSuggestionSchema.parse(body);
    const { project } = await getReviewProjectByInvitationToken(token);

    const parsed = await parseContractorScopeAddition({
      category: input.category,
      description: input.description,
      projectTitle: project.title,
    });

    const suggestion = await createDraftSuggestion({
      token,
      payload: {
        suggestion_type: "add",
        category: input.category,
        suggested_text: parsed.text,
        contractor_note: parsed.note,
      },
    });

    return NextResponse.json({ suggestion }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
