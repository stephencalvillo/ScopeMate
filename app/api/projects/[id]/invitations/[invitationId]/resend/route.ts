import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { ensureUserRecord } from "@/lib/auth/clerk";
import {
  getInvitationForProject,
  resendContractorInvitation,
} from "@/lib/contractor/invitations";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { id, invitationId } = await context.params;
    const project = await getOwnedProject(id);
    const homeowner = await ensureUserRecord();
    const invitation = await getInvitationForProject(id, invitationId);

    await resendContractorInvitation({ invitation, project, homeowner });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
