import "server-only";

import { ForbiddenError, NotFoundError } from "@/lib/auth/clerk";
import { displayContractorName } from "@/lib/contractor/display-contractor";
import { formatReviewDate } from "@/lib/contractor/review-display";
import { getInvitationByToken } from "@/lib/contractor/invitations";
import type { ProjectAcceptedProposalSummary } from "@/lib/estimates/proposal-decision-types";
import { createServiceClient } from "@/lib/db/supabase";
import {
  getEstimateForReview,
  getProposalEstimateForInvitation,
} from "@/lib/estimates/estimates";
import {
  formatProposalRange,
  proposalRangeFromLineItems,
} from "@/lib/estimates/money";
import {
  sendProposalAcceptedEmail,
  sendProposalNotSelectedEmail,
} from "@/lib/email/send-contractor-emails";
import type { ContractorEstimate, Project, User } from "@/types";

export type { ProjectAcceptedProposalSummary } from "@/lib/estimates/proposal-decision-types";

export async function getProjectAcceptedEstimate(projectId: string) {
  const supabase = createServiceClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("accepted_estimate_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project?.accepted_estimate_id) return null;

  const { data: estimate, error } = await supabase
    .from("contractor_estimates")
    .select("*")
    .eq("id", project.accepted_estimate_id)
    .maybeSingle();

  if (error) throw error;
  if (!estimate) return null;

  const { data: lineItems, error: lineItemsError } = await supabase
    .from("estimate_line_items")
    .select("*")
    .eq("estimate_id", estimate.id)
    .order("sort_order", { ascending: true });

  if (lineItemsError) throw lineItemsError;

  return {
    ...(estimate as ContractorEstimate),
    line_items: lineItems ?? [],
  };
}

export async function getProjectAcceptedProposalSummary(
  projectId: string
): Promise<ProjectAcceptedProposalSummary | null> {
  const estimate = await getProjectAcceptedEstimate(projectId);
  if (!estimate) return null;

  const supabase = createServiceClient();
  const { data: invitation, error } = await supabase
    .from("contractor_invitations")
    .select("id, contractor_name, contractor_email, contractor_company")
    .eq("id", estimate.invitation_id)
    .maybeSingle();

  if (error) throw error;
  if (!invitation) return null;

  const { minTotal, maxTotal } = proposalRangeFromLineItems(
    estimate.line_items ?? []
  );

  return {
    estimate,
    invitationId: invitation.id,
    contractorName: displayContractorName(invitation),
    contractorCompany: invitation.contractor_company,
    rangeLabel: formatProposalRange(minTotal, maxTotal),
    acceptedAtLabel: formatReviewDate(estimate.accepted_at),
  };
}

export async function acceptProposalForProject({
  projectId,
  invitationId,
  homeowner,
  project,
  request,
}: {
  projectId: string;
  invitationId: string;
  homeowner: User;
  project: Project;
  request?: Request;
}) {
  const supabase = createServiceClient();

  const { data: ownedProject, error: projectError } = await supabase
    .from("projects")
    .select("id, title, accepted_estimate_id, homeowner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!ownedProject || ownedProject.homeowner_id !== homeowner.id) {
    throw new ForbiddenError("You do not have access to this project.");
  }

  if (ownedProject.accepted_estimate_id) {
    throw new ForbiddenError("A proposal has already been accepted for this project.");
  }

  const estimate = await getProposalEstimateForInvitation({
    projectId,
    invitationId,
  });

  if (!estimate) {
    throw new NotFoundError("No submitted proposal was found for this review.");
  }

  if (estimate.status !== "submitted") {
    throw new ForbiddenError("This proposal is no longer available to accept.");
  }

  if ((estimate.line_items ?? []).length === 0) {
    throw new ForbiddenError("This proposal does not include any pricing.");
  }

  const { data: invitation, error: invitationError } = await supabase
    .from("contractor_invitations")
    .select("*")
    .eq("id", invitationId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (invitationError) throw invitationError;
  if (!invitation) {
    throw new NotFoundError("Contractor review not found.");
  }

  const now = new Date().toISOString();
  const range = proposalRangeFromLineItems(estimate.line_items ?? []);

  const { data: acceptedEstimate, error: acceptError } = await supabase
    .from("contractor_estimates")
    .update({
      status: "accepted",
      accepted_at: now,
      updated_at: now,
    })
    .eq("id", estimate.id)
    .eq("status", "submitted")
    .select("*")
    .maybeSingle();

  if (acceptError) throw acceptError;
  if (!acceptedEstimate) {
    throw new ForbiddenError("This proposal is no longer available to accept.");
  }

  const { error: projectUpdateError } = await supabase
    .from("projects")
    .update({
      accepted_estimate_id: estimate.id,
      updated_at: now,
    })
    .eq("id", projectId)
    .is("accepted_estimate_id", null);

  if (projectUpdateError) throw projectUpdateError;

  const { data: otherEstimates, error: othersError } = await supabase
    .from("contractor_estimates")
    .select("id, invitation_id")
    .eq("project_id", projectId)
    .eq("status", "submitted")
    .neq("id", estimate.id);

  if (othersError) throw othersError;

  const declinedInvitationIds = (otherEstimates ?? []).map(
    (row) => row.invitation_id as string
  );

  if ((otherEstimates ?? []).length > 0) {
    const otherIds = otherEstimates!.map((row) => row.id as string);

    const { error: declineError } = await supabase
      .from("contractor_estimates")
      .update({
        status: "declined",
        declined_at: now,
        updated_at: now,
      })
      .in("id", otherIds);

    if (declineError) throw declineError;

    const { error: closeInvitesError } = await supabase
      .from("contractor_invitations")
      .update({
        status: "closed_out",
        updated_at: now,
      })
      .in("id", declinedInvitationIds)
      .neq("status", "revoked")
      .neq("status", "expired");

    if (closeInvitesError) throw closeInvitesError;

    const { data: otherInvitations, error: otherInvitesError } = await supabase
      .from("contractor_invitations")
      .select("contractor_name, contractor_email, invitation_token")
      .in("id", declinedInvitationIds);

    if (otherInvitesError) throw otherInvitesError;

    for (const invite of otherInvitations ?? []) {
      if (!invite.contractor_email || !invite.invitation_token) continue;

      try {
        await sendProposalNotSelectedEmail({
          to: invite.contractor_email,
          contractorName: invite.contractor_name ?? "Contractor",
          homeownerName: homeowner.name ?? homeowner.email,
          projectTitle: project.title,
          selectedContractorName: invitation.contractor_name,
          reviewToken: invite.invitation_token,
          request,
        });
      } catch (error) {
        console.error("Failed to send proposal not selected email:", error);
      }
    }
  }

  try {
    await sendProposalAcceptedEmail({
      to: invitation.contractor_email,
      contractorName: invitation.contractor_name,
      homeownerName: homeowner.name ?? homeowner.email,
      projectTitle: project.title,
      proposalMinTotal: range.minTotal,
      proposalMaxTotal: range.maxTotal,
      reviewToken: invitation.invitation_token,
      request,
    });
  } catch (error) {
    console.error("Failed to send proposal accepted email:", error);
  }

  return getProposalEstimateForInvitation({ projectId, invitationId });
}

export async function getProposalOutcomeForReviewToken(token: string) {
  const invitation = await getInvitationByToken(token);
  const supabase = createServiceClient();
  const { data: review } = await supabase
    .from("contractor_reviews")
    .select("id")
    .eq("invitation_id", invitation.id)
    .maybeSingle();

  const estimate = review?.id ? await getEstimateForReview(review.id) : null;

  return {
    invitation_status: invitation.status,
    estimate_status: estimate?.status ?? null,
    closed_out:
      invitation.status === "closed_out" || estimate?.status === "declined",
    accepted: estimate?.status === "accepted",
  };
}
