import {
  isShareLinkPlaceholder,
  SHARE_LINK_PLACEHOLDER_NAME,
} from "@/lib/contractor/project-share";
import type { ContractorInvitationWithReview } from "@/types";

export function displayContractorName(
  invitation: Pick<ContractorInvitationWithReview, "contractor_name" | "contractor_email">
) {
  if (
    invitation.contractor_name === SHARE_LINK_PLACEHOLDER_NAME &&
    isShareLinkPlaceholder(invitation)
  ) {
    return "Contractor";
  }

  return invitation.contractor_name;
}
