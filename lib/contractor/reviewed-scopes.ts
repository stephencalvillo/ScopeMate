import { listInvitationsForProject } from "@/lib/contractor/invitations";
import { displayContractorName } from "@/lib/contractor/display-contractor";
import { isShareLinkPlaceholder } from "@/lib/contractor/project-share";
import { listHomeownerSuggestionsForInvitation } from "@/lib/contractor/suggestions";
import { createServiceClient } from "@/lib/db/supabase";
import { proposalRangeFromLineItems } from "@/lib/estimates/money";
import type { ContractorInvitationWithReview, EstimateStatus } from "@/types";

import type { ScopeSuggestionWithMeta } from "@/types";

export type ReviewedScopeSummary = {
  invitation: ContractorInvitationWithReview;
  pending_suggestion_count: number;
  total_suggestion_count: number;
  proposal_min_total: number | null;
  proposal_max_total: number | null;
  estimate_status: EstimateStatus | null;
  is_selected_proposal: boolean;
  project_has_selected_proposal: boolean;
  general_notes: string | null;
};

export type ReviewedScopeDetail = ReviewedScopeSummary & {
  suggestions: ScopeSuggestionWithMeta[];
};

function isReviewedScopeCandidate(invitation: ContractorInvitationWithReview) {
  if (invitation.status === "revoked" || invitation.status === "expired") {
    return false;
  }

  if (
    isShareLinkPlaceholder(invitation) &&
    !invitation.accepted_at &&
    invitation.review?.status !== "submitted"
  ) {
    return false;
  }

  if (invitation.review?.status === "submitted") {
    return true;
  }

  if (invitation.accepted_at) {
    return true;
  }

  if (!isShareLinkPlaceholder(invitation)) {
    return true;
  }

  return false;
}

export { displayContractorName };

export async function listReviewedScopesForProject(
  projectId: string
): Promise<ReviewedScopeSummary[]> {
  const invitations = await listInvitationsForProject(projectId);
  const candidates = invitations.filter(isReviewedScopeCandidate);

  if (candidates.length === 0) {
    return [];
  }

  const supabase = createServiceClient();
  const invitationIds = candidates.map((invitation) => invitation.id);

  const { data: projectRow, error: projectError } = await supabase
    .from("projects")
    .select("accepted_estimate_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) throw projectError;

  const { data: suggestions, error } = await supabase
    .from("scope_suggestions")
    .select("invitation_id, status")
    .eq("project_id", projectId)
    .in("invitation_id", invitationIds)
    .neq("status", "draft")
    .neq("status", "withdrawn");

  if (error) throw error;

  const { data: estimates, error: estimatesError } = await supabase
    .from("contractor_estimates")
    .select(
      "id, invitation_id, status, total, estimate_line_items(labor_cost, material_cost)"
    )
    .eq("project_id", projectId)
    .in("status", ["submitted", "accepted", "declined"])
    .in("invitation_id", invitationIds);

  if (estimatesError) throw estimatesError;

  const proposalRangeByInvitation = new Map<
    string,
    { minTotal: number; maxTotal: number }
  >();
  const estimateStatusByInvitation = new Map<string, EstimateStatus>();
  let selectedInvitationId: string | null = null;

  for (const row of estimates ?? []) {
    const lineItems =
      (row as { estimate_line_items?: Array<{ labor_cost: number; material_cost: number }> })
        .estimate_line_items ?? [];
    const range = proposalRangeFromLineItems(lineItems);
    proposalRangeByInvitation.set(row.invitation_id as string, range);
    estimateStatusByInvitation.set(
      row.invitation_id as string,
      row.status as EstimateStatus
    );

    if (
      projectRow?.accepted_estimate_id &&
      row.id === projectRow.accepted_estimate_id
    ) {
      selectedInvitationId = row.invitation_id as string;
    }
  }

  const countsByInvitation = new Map<
    string,
    { pending: number; total: number }
  >();

  for (const row of suggestions ?? []) {
    const current = countsByInvitation.get(row.invitation_id as string) ?? {
      pending: 0,
      total: 0,
    };
    current.total += 1;
    if (["pending", "follow_up_requested"].includes(row.status as string)) {
      current.pending += 1;
    }
    countsByInvitation.set(row.invitation_id as string, current);
  }

  return candidates.map((invitation) => {
    const counts = countsByInvitation.get(invitation.id) ?? {
      pending: 0,
      total: 0,
    };
    const proposalRange = proposalRangeByInvitation.get(invitation.id);
    const estimateStatus = estimateStatusByInvitation.get(invitation.id) ?? null;

    return {
      invitation,
      pending_suggestion_count: counts.pending,
      total_suggestion_count: counts.total,
      proposal_min_total: proposalRange?.minTotal ?? null,
      proposal_max_total: proposalRange?.maxTotal ?? null,
      estimate_status: estimateStatus,
      is_selected_proposal: invitation.id === selectedInvitationId,
      project_has_selected_proposal: Boolean(projectRow?.accepted_estimate_id),
      general_notes: invitation.review?.notes?.trim() || null,
    };
  });
}

export async function getReviewedScopeForProject({
  projectId,
  invitationId,
}: {
  projectId: string;
  invitationId: string;
}) {
  const scopes = await listReviewedScopesForProject(projectId);
  const match = scopes.find((scope) => scope.invitation.id === invitationId);
  return match ?? null;
}

export async function getReviewedScopeDetailForProject({
  projectId,
  invitationId,
}: {
  projectId: string;
  invitationId: string;
}): Promise<ReviewedScopeDetail | null> {
  const scope = await getReviewedScopeForProject({ projectId, invitationId });
  if (!scope) return null;

  const suggestions = await listHomeownerSuggestionsForInvitation(
    projectId,
    invitationId
  );

  return {
    ...scope,
    suggestions,
  };
}
