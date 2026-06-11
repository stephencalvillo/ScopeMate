import { cookies } from "next/headers";
import { ForbiddenError, resolveClerkUserId, resolveClerkUserIdFromHeaders } from "@/lib/auth/clerk";
import { REVIEW_SESSION_COOKIE } from "@/lib/contractor/constants";
import { getInvitationByToken } from "@/lib/contractor/invitations";
import { verifyReviewSessionValue } from "@/lib/contractor/review-session";
import type { ContractorInvitation } from "@/types";

export async function canEditReview(
  token: string,
  invitation?: Pick<ContractorInvitation, "contractor_user_id" | "invitation_token">,
  request?: Request
) {
  const resolvedInvitation =
    invitation ?? (await getInvitationByToken(token, request));
  const userId = request
    ? await resolveClerkUserId(request)
    : await resolveClerkUserIdFromHeaders();

  if (
    userId &&
    resolvedInvitation.contractor_user_id &&
    resolvedInvitation.contractor_user_id === userId
  ) {
    return true;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(REVIEW_SESSION_COOKIE)?.value;
  if (!session) return false;

  return verifyReviewSessionValue(
    session,
    resolvedInvitation.invitation_token
  );
}

export async function assertReviewEditor(token: string, request?: Request) {
  const invitation = await getInvitationByToken(token, request);
  if (!(await canEditReview(token, invitation, request))) {
    throw new ForbiddenError(
      "Only the invited contractor can edit this review. Use the browser where you confirmed your details, or verify your email to continue."
    );
  }
  return invitation;
}

export async function assertReviewEmailUnlock({
  token,
  contractorEmail,
  request,
}: {
  token: string;
  contractorEmail: string;
  request?: Request;
}) {
  const invitation = await getInvitationByToken(token, request);
  if (!invitation.accepted_at) {
    throw new ForbiddenError("Complete the identity step before verifying email.");
  }

  if (
    contractorEmail.trim().toLowerCase() !==
    invitation.contractor_email.trim().toLowerCase()
  ) {
    throw new ForbiddenError(
      "That email does not match the contractor on this invitation."
    );
  }

  return invitation;
}
