import { displayContractorName } from "@/lib/contractor/display-contractor";
import type { ContractorInvitationWithReview } from "@/types";
import { CONTRACTOR_INVITATION_STATUS_LABELS } from "@/types";

export function formatReviewDate(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isReviewSubmitted(
  invitation: Pick<ContractorInvitationWithReview, "status"> & {
    review?: { status?: string; submitted_at?: string | null } | null;
  }
) {
  return (
    invitation.review?.status === "submitted" ||
    invitation.status === "submitted"
  );
}

export function formatReviewedScopeHeadline(
  invitation: Pick<
    ContractorInvitationWithReview,
    "contractor_name" | "contractor_email" | "status"
  > & {
    review?: { status?: string } | null;
  },
  submitted: boolean
) {
  const name = displayContractorName(invitation);

  if (submitted) {
    return `${name} submitted a review`;
  }

  switch (invitation.status) {
    case "in_review":
      return `${name} is reviewing your scope`;
    case "pending":
      return `${name} opened your review link`;
    case "revoked":
      return `${name}'s review link was revoked`;
    case "expired":
      return `${name}'s review link expired`;
    default:
      return CONTRACTOR_INVITATION_STATUS_LABELS[invitation.status];
  }
}
