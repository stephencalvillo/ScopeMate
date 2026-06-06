import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { getSubmittedEstimateForInvitation } from "@/lib/estimates/estimates";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { id, invitationId } = await context.params;
    await getOwnedProject(id);
    const estimate = await getSubmittedEstimateForInvitation({
      projectId: id,
      invitationId,
    });

    return NextResponse.json({ estimate });
  } catch (error) {
    return jsonError(error);
  }
}
