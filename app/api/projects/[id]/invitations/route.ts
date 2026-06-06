import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { ensureUserRecord } from "@/lib/auth/clerk";
import {
  createContractorInvitation,
  listInvitationsForProject,
} from "@/lib/contractor/invitations";
import { createInvitationSchema } from "@/lib/validators/invitation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);
    const invitations = await listInvitationsForProject(id);
    return NextResponse.json({ invitations });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getOwnedProject(id);
    const homeowner = await ensureUserRecord();
    const body = await request.json();
    const input = createInvitationSchema.parse(body);

    const invitation = await createContractorInvitation({
      project,
      homeowner,
      contractorName: input.contractor_name,
      contractorEmail: input.contractor_email,
      contractorCompany: input.contractor_company,
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
