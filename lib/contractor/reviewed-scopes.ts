import { listInvitationsForProject } from "@/lib/contractor/invitations";
import { displayContractorName } from "@/lib/contractor/display-contractor";
import { isShareLinkPlaceholder } from "@/lib/contractor/project-share";
import { listHomeownerSuggestionsForInvitation } from "@/lib/contractor/suggestions";
import { createServiceClient } from "@/lib/db/supabase";
import type { ContractorInvitationWithReview } from "@/types";

import type { ScopeSuggestionWithMeta } from "@/types";

export type ReviewedScopeSummary = {
  invitation: ContractorInvitationWithReview;
  pending_suggestion_count: number;
  total_suggestion_count: number;
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

  const { data: suggestions, error } = await supabase
    .from("scope_suggestions")
    .select("invitation_id, status")
    .eq("project_id", projectId)
    .in("invitation_id", invitationIds)
    .neq("status", "draft")
    .neq("status", "withdrawn");

  if (error) throw error;

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

    return {
      invitation,
      pending_suggestion_count: counts.pending,
      total_suggestion_count: counts.total,
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
