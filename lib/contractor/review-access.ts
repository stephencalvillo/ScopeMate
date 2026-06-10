import { cookies } from "next/headers";
import { ForbiddenError, resolveClerkUserId, resolveClerkUserIdFromHeaders } from "@/lib/auth/clerk";
import { REVIEW_SESSION_COOKIE } from "@/lib/contractor/constants";
import { getInvitationByToken } from "@/lib/contractor/invitations";
import { verifyReviewSessionValue } from "@/lib/contractor/review-session";
import type { ContractorInvitation } from "@/types";

export async function canEditReview(
  token: string,
  invitation?: Pick<ContractorInvitation, "contractor_user_id">,
  request?: Request
) {
  const resolvedInvitation = invitation ?? (await getInvitationByToken(token));
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

  return verifyReviewSessionValue(session, token);
}

export async function assertReviewEditor(token: string) {
  const invitation = await getInvitationByToken(token);
  if (!(await canEditReview(token, invitation))) {
    throw new ForbiddenError(
      "Only the invited contractor can edit this review. Use the browser where you confirmed your details, or verify your email to continue."
    );
  }
  return invitation;
}

export async function assertReviewEmailUnlock({
  token,
  contractorEmail,
}: {
  token: string;
  contractorEmail: string;
}) {
  const invitation = await getInvitationByToken(token);
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
