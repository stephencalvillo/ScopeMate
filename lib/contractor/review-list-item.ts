import type {
  ContractorInvitationWithReview,
  EstimateStatus,
  Project,
} from "@/types";

export type ContractorReviewListItem = {
  invitation: ContractorInvitationWithReview;
  project: Pick<
    Project,
    | "id"
    | "title"
    | "city"
    | "zip"
    | "location"
    | "project_type"
    | "accepted_estimate_id"
    | "ai_summary"
    | "original_description"
  >;
  review_url: string;
  proposal_range: string | null;
  estimate_status: EstimateStatus | null;
  estimate_id: string | null;
  estimate_submitted_at: string | null;
  is_selected_proposal: boolean;
  project_has_selected_proposal: boolean;
};

export function isActiveContractorReview(item: ContractorReviewListItem): boolean {
  const status = item.invitation.status;

  if (status === "closed_out" || status === "expired" || status === "revoked") {
    return false;
  }

  if (item.estimate_status === "declined") {
    return false;
  }

  if (item.project_has_selected_proposal && !item.is_selected_proposal) {
    return false;
  }

  if (item.is_selected_proposal || item.estimate_status === "accepted") {
    return false;
  }

  return true;
}

export function isAcceptedContractorReview(item: ContractorReviewListItem) {
  return item.is_selected_proposal || item.estimate_status === "accepted";
}

export function isInReviewContractorReview(item: ContractorReviewListItem) {
  return isActiveContractorReview(item);
}

export function isHistoryContractorReview(item: ContractorReviewListItem) {
  return !isAcceptedContractorReview(item) && !isInReviewContractorReview(item);
}

export function partitionContractorReviews(reviews: ContractorReviewListItem[]) {
  return {
    accepted: reviews.filter(isAcceptedContractorReview),
    inReview: reviews.filter(isInReviewContractorReview),
    history: reviews.filter(isHistoryContractorReview),
  };
}

export function filterActiveContractorReviews(
  reviews: ContractorReviewListItem[]
) {
  return reviews.filter(isActiveContractorReview);
}
