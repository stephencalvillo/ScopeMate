import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { rejectProposalForProject } from "@/lib/estimates/proposal-decision";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { id, invitationId } = await context.params;
    const project = await getOwnedProject(id, request);
    const homeowner = await ensureUserRecord(request);
    const estimate = await rejectProposalForProject({
      projectId: id,
      invitationId,
      homeowner,
      project,
      request,
    });

    return NextResponse.json({ estimate });
  } catch (error) {
    return jsonError(error);
  }
}
