import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { askSuggestionFollowUp } from "@/lib/contractor/suggestions";
import { followUpMessageSchema } from "@/lib/validators/suggestion";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; suggestionId: string }> }
) {
  try {
    const { id, suggestionId } = await context.params;
    const project = await getOwnedProject(id);
    const homeowner = await ensureUserRecord();
    const body = await request.json();
    const input = followUpMessageSchema.parse(body);

    const suggestion = await askSuggestionFollowUp({
      project,
      homeowner,
      suggestionId,
      message: input.message,
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    return jsonError(error);
  }
}
