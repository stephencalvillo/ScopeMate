import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { rejectSuggestion } from "@/lib/contractor/suggestions";
import { rejectSuggestionSchema } from "@/lib/validators/suggestion";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; suggestionId: string }> }
) {
  try {
    const { id, suggestionId } = await context.params;
    await getOwnedProject(id);
    const homeowner = await ensureUserRecord();
    const body = await request.json().catch(() => ({}));
    const input = rejectSuggestionSchema.parse(body);

    const suggestion = await rejectSuggestion({
      projectId: id,
      suggestionId,
      homeownerId: homeowner.id,
      reason: input.reason,
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    return jsonError(error);
  }
}
