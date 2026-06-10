import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { revokeContractorInvitation } from "@/lib/contractor/invitations";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { id, invitationId } = await context.params;
    await getOwnedProject(id);
    const invitation = await revokeContractorInvitation(id, invitationId);
    return NextResponse.json({ invitation });
  } catch (error) {
    return jsonError(error);
  }
}
