import type { ContractorReviewListItem } from "@/lib/contractor/review-list-item";
import { isHistoryContractorReview } from "@/lib/contractor/review-list-item";

export type BidHistoryFilter = "all" | "submitted" | "declined" | "closed";

export type BidHistoryOutcome =
  | "submitted"
  | "declined"
  | "not_selected"
  | "closed"
  | "expired"
  | "review_only";

export function getBidHistoryOutcome(
  item: ContractorReviewListItem
): BidHistoryOutcome {
  if (item.invitation.status === "expired") {
    return "expired";
  }

  if (item.invitation.status === "closed_out") {
    return "closed";
  }

  if (item.estimate_status === "declined") {
    return "declined";
  }

  if (item.project_has_selected_proposal && !item.is_selected_proposal) {
    return "not_selected";
  }

  if (item.estimate_status === "submitted") {
    return "submitted";
  }

  if (
    item.invitation.review?.status === "submitted" ||
    item.invitation.status === "submitted"
  ) {
    return "review_only";
  }

  return "closed";
}

export function bidHistoryOutcomeLabel(outcome: BidHistoryOutcome) {
  switch (outcome) {
    case "submitted":
      return "Proposal submitted";
    case "declined":
      return "Declined";
    case "not_selected":
      return "Not selected";
    case "expired":
      return "Expired";
    case "review_only":
      return "Review submitted";
    case "closed":
    default:
      return "Closed";
  }
}

export function bidHistoryOutcomeBadgeVariant(
  outcome: BidHistoryOutcome
): "success" | "secondary" | "info" {
  switch (outcome) {
    case "submitted":
    case "review_only":
      return "info";
    case "declined":
    case "not_selected":
    case "expired":
    case "closed":
    default:
      return "secondary";
  }
}

export function matchesBidHistoryFilter(
  item: ContractorReviewListItem,
  filter: BidHistoryFilter
) {
  if (filter === "all") {
    return true;
  }

  const outcome = getBidHistoryOutcome(item);

  switch (filter) {
    case "submitted":
      return outcome === "submitted" || outcome === "review_only";
    case "declined":
      return outcome === "declined" || outcome === "not_selected";
    case "closed":
      return outcome === "closed" || outcome === "expired";
    default:
      return true;
  }
}

export function filterBidHistoryReviews(
  reviews: ContractorReviewListItem[],
  filter: BidHistoryFilter
) {
  return reviews.filter(
    (item) =>
      isHistoryContractorReview(item) && matchesBidHistoryFilter(item, filter)
  );
}

export function listBidHistoryReviews(reviews: ContractorReviewListItem[]) {
  return reviews.filter(isHistoryContractorReview);
}
