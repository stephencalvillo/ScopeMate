import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { assertReviewEmailUnlock } from "@/lib/contractor/review-access";
import { reviewSessionCookie } from "@/lib/contractor/review-session";
import { contractorEmailUnlockSchema } from "@/lib/validators/invitation";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const body = await request.json();
    const input = contractorEmailUnlockSchema.parse(body);

    const invitation = await assertReviewEmailUnlock({
      token,
      contractorEmail: input.contractor_email,
      request,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(reviewSessionCookie(invitation.invitation_token));
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
