import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { acceptProposalForProject } from "@/lib/estimates/proposal-decision";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { id, invitationId } = await context.params;
    const project = await getOwnedProject(id);
    const homeowner = await ensureUserRecord();
    const estimate = await acceptProposalForProject({
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
