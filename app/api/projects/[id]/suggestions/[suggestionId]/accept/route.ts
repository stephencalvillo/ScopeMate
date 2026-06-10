import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { acceptSuggestion } from "@/lib/contractor/suggestions";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; suggestionId: string }> }
) {
  try {
    const { id, suggestionId } = await context.params;
    await getOwnedProject(id);
    const homeowner = await ensureUserRecord();
    const result = await acceptSuggestion({
      projectId: id,
      suggestionId,
      homeownerId: homeowner.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
