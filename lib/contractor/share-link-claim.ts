import { ForbiddenError } from "@/lib/auth/clerk";
import { getContractorProfile } from "@/lib/contractor/profile";
import {
  getInvitationByToken,
  getReviewProjectByInvitationToken,
} from "@/lib/contractor/invitations";
import {
  isShareLinkInvitation,
  isShareLinkPlaceholder,
} from "@/lib/contractor/project-share";
import { createServiceClient } from "@/lib/db/supabase";
import type { ContractorInvitation, User } from "@/types";

export async function claimShareLinkInvitation(
  token: string,
  user: User
): Promise<ContractorInvitation> {
  const { invitation, project } = await getReviewProjectByInvitationToken(token);

  if (!isShareLinkInvitation(invitation, project)) {
    throw new ForbiddenError(
      "Only open share links can be claimed from this flow."
    );
  }

  if (
    invitation.contractor_user_id &&
    invitation.contractor_user_id !== user.id
  ) {
    throw new ForbiddenError(
      "Another contractor account is already linked to this review."
    );
  }

  const profile = await getContractorProfile(user.id);
  if (!profile?.onboarding_completed_at) {
    throw new ForbiddenError(
      "Finish contractor profile setup before claiming this review."
    );
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  const now = new Date().toISOString();

  const { data, error } = await createServiceClient()
    .from("contractor_invitations")
    .update({
      contractor_user_id: user.id,
      contractor_email: isShareLinkPlaceholder(invitation)
        ? normalizedEmail
        : invitation.contractor_email,
      contractor_name:
        profile?.contact_name?.trim() ||
        invitation.contractor_name ||
        user.name ||
        "Contractor",
      contractor_company:
        profile?.company_name?.trim() || invitation.contractor_company,
      accepted_at: invitation.accepted_at ?? now,
      status: invitation.status === "pending" ? "in_review" : invitation.status,
      last_accessed_at: now,
      updated_at: now,
    })
    .eq("id", invitation.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ContractorInvitation;
}

export async function claimShareLinkInvitationIfReady(
  token: string,
  user: User
) {
  const profile = await getContractorProfile(user.id);
  if (!profile?.onboarding_completed_at) {
    return null;
  }

  try {
    const invitation = await getInvitationByToken(token);
    const { project } = await getReviewProjectByInvitationToken(token);

    if (!isShareLinkInvitation(invitation, project)) {
      return null;
    }

    if (invitation.contractor_user_id === user.id) {
      return invitation;
    }

    return await claimShareLinkInvitation(token, user);
  } catch {
    return null;
  }
}
