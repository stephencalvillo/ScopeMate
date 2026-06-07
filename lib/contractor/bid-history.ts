import { ForbiddenError, NotFoundError } from "@/lib/auth/clerk";
import { buildReviewUrl } from "@/lib/contractor/urls";
import {
  formatProposalRange,
  proposalRangeFromLineItems,
} from "@/lib/estimates/money";
import { getProposalEstimateForInvitation } from "@/lib/estimates/estimates";
import { createServiceClient } from "@/lib/db/supabase";
import { listProjectPhotosWithUrls } from "@/lib/storage/photos";
import type { SharedPhoto } from "@/lib/phase2/client";
import {
  isHistoryContractorReview,
  type ContractorReviewListItem,
} from "@/lib/contractor/review-list-item";
import type {
  ContractorEstimate,
  ContractorInvitationWithReview,
  ContractorReview,
  ProjectWithScope,
  ScopeItem,
} from "@/types";

export type ContractorBidDetail = {
  item: ContractorReviewListItem;
  project: ProjectWithScope;
  estimate: ContractorEstimate | null;
  photos: SharedPhoto[];
};

function normalizeReview(
  review: ContractorReview | ContractorReview[] | null | undefined
): ContractorReview | null {
  if (!review) return null;
  return Array.isArray(review) ? review[0] ?? null : review;
}

export async function getContractorBidDetail(
  userId: string,
  invitationId: string
): Promise<ContractorBidDetail> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("contractor_invitations")
    .select(
      `
        *,
        contractor_reviews(*),
        projects(
          id,
          title,
          city,
          zip,
          location,
          project_type,
          accepted_estimate_id,
          ai_summary,
          original_description
        ),
        contractor_estimates(
          id,
          status,
          submitted_at,
          accepted_at,
          declined_at,
          estimate_line_items(labor_cost, material_cost)
        )
      `
    )
    .eq("id", invitationId)
    .eq("contractor_user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new NotFoundError("Bid not found.");
  }

  const record = data as ContractorInvitationWithReview & {
    projects: ContractorReviewListItem["project"] | null;
    contractor_reviews: ContractorReview | ContractorReview[] | null;
    contractor_estimates:
      | {
          id: string;
          status: ContractorReviewListItem["estimate_status"];
          submitted_at: string | null;
          estimate_line_items: Array<{
            labor_cost: number;
            material_cost: number;
          }>;
        }
      | Array<{
          id: string;
          status: ContractorReviewListItem["estimate_status"];
          submitted_at: string | null;
          estimate_line_items: Array<{
            labor_cost: number;
            material_cost: number;
          }>;
        }>
      | null;
  };

  const projectRecord = record.projects;
  if (!projectRecord) {
    throw new NotFoundError("Bid not found.");
  }

  const review = normalizeReview(record.contractor_reviews);
  const invitationBase = { ...record };
  delete (invitationBase as { projects?: unknown }).projects;
  delete (invitationBase as { contractor_reviews?: unknown }).contractor_reviews;
  delete (invitationBase as { contractor_estimates?: unknown }).contractor_estimates;

  const invitation = invitationBase as ContractorInvitationWithReview;
  const estimateRaw = record.contractor_estimates;
  const estimateSummary = Array.isArray(estimateRaw)
    ? estimateRaw[0] ?? null
    : estimateRaw;

  const { data: scopeItems, error: scopeError } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", projectRecord.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (scopeError) throw scopeError;

  const estimate = await getProposalEstimateForInvitation({
    projectId: projectRecord.id,
    invitationId,
  });

  const lineItems = estimateSummary?.estimate_line_items ?? [];
  const { minTotal, maxTotal } = proposalRangeFromLineItems(lineItems);
  const proposalRange = formatProposalRange(minTotal, maxTotal);
  const projectHasSelectedProposal = Boolean(projectRecord.accepted_estimate_id);
  const isSelectedProposal = Boolean(
    estimateSummary?.id &&
      projectRecord.accepted_estimate_id === estimateSummary.id
  );

  const item: ContractorReviewListItem = {
    invitation: {
      ...invitation,
      review,
      review_url: buildReviewUrl(invitation.invitation_token),
    },
    project: projectRecord,
    review_url: buildReviewUrl(invitation.invitation_token),
    proposal_range: proposalRange || null,
    estimate_status: estimateSummary?.status ?? null,
    estimate_id: estimateSummary?.id ?? null,
    estimate_submitted_at: estimateSummary?.submitted_at ?? null,
    is_selected_proposal: isSelectedProposal,
    project_has_selected_proposal: projectHasSelectedProposal,
  };

  if (!isHistoryContractorReview(item)) {
    throw new ForbiddenError("This bid is still active.");
  }

  const photos = await listProjectPhotosWithUrls(projectRecord.id).then((rows) =>
    rows.map((photo) => ({
      id: photo.id,
      file_name: photo.file_name,
      url: photo.url,
    }))
  );

  return {
    item,
    project: {
      ...projectRecord,
      scope_items: (scopeItems ?? []) as ScopeItem[],
    } as ProjectWithScope,
    estimate,
    photos,
  };
}
