import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { completeContractorIdentity } from "@/lib/contractor/invitations";
import { contractorIdentitySchema } from "@/lib/validators/invitation";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const body = await request.json();
    const input = contractorIdentitySchema.parse(body);

    const invitation = await completeContractorIdentity({
      token,
      contractorName: input.contractor_name,
      contractorEmail: input.contractor_email,
      contractorCompany: input.contractor_company,
    });

    return NextResponse.json({ invitation });
  } catch (error) {
    return jsonError(error);
  }
}
