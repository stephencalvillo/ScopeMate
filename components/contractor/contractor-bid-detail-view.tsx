import {
  AcceptedProposalProjectView,
  ContractorProjectDetailView,
} from "@/components/review/accepted-proposal-project-view";
import { MyProjectsBreadcrumb } from "@/components/layout/my-projects-breadcrumb";
import type { ContractorBidDetail } from "@/lib/contractor/bid-history";
import {
  bidHistoryOutcomeBadgeVariant,
  bidHistoryOutcomeLabel,
  getBidHistoryOutcome,
  type BidHistoryOutcome,
} from "@/lib/contractor/bid-history-display";

function getBidDetailEstimateMode(outcome: BidHistoryOutcome) {
  if (outcome === "submitted" || outcome === "review_only") {
    return "submitted" as const;
  }

  return "plain" as const;
}

export function ContractorBidDetailView({ bid }: { bid: ContractorBidDetail }) {
  const { item, project, estimate, photos } = bid;
  const outcome = getBidHistoryOutcome(item);
  const isAccepted =
    estimate?.status === "accepted" || item.is_selected_proposal;
  const breadcrumb = <MyProjectsBreadcrumb href="/contractor" />;

  if (isAccepted && estimate) {
    return (
      <AcceptedProposalProjectView
        breadcrumb={breadcrumb}
        project={project}
        photos={photos}
        estimate={estimate}
        notes={item.invitation.review?.notes}
        audience="contractor"
      />
    );
  }

  return (
    <ContractorProjectDetailView
      breadcrumb={breadcrumb}
      project={project}
      photos={photos}
      estimate={estimate}
      notes={item.invitation.review?.notes}
      audience="contractor"
      statusBadge={{
        label: bidHistoryOutcomeLabel(outcome),
        variant: bidHistoryOutcomeBadgeVariant(outcome),
      }}
      estimateMode={getBidDetailEstimateMode(outcome)}
    />
  );
}
