import { listInvitationsForProject } from "@/lib/contractor/invitations";
import { isShareLinkPlaceholder } from "@/lib/contractor/project-share";
import { isMissingColumnError, isMissingTableError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import type { ContractorInvitationWithReview } from "@/types";

export type ProjectActivityKind =
  | "share_link_created"
  | "share_link_viewed"
  | "invitation_sent"
  | "invitation_opened"
  | "invitation_review_started"
  | "invitation_review_submitted"
  | "proposal_accepted"
  | "proposal_declined";

export type ProjectActivityItem = {
  id: string;
  kind: ProjectActivityKind;
  occurred_at: string;
  title: string;
  description?: string;
  invitation_id?: string;
  invitation?: ContractorInvitationWithReview;
};

function invitationLabel(invitation: ContractorInvitationWithReview) {
  if (isShareLinkPlaceholder(invitation)) {
    return invitation.contractor_company
      ? `Contractor · ${invitation.contractor_company}`
      : "Contractor";
  }

  return invitation.contractor_company
    ? `${invitation.contractor_name} · ${invitation.contractor_company}`
    : invitation.contractor_name;
}

function buildInvitationActivity(
  invitation: ContractorInvitationWithReview
): ProjectActivityItem[] {
  const events: ProjectActivityItem[] = [];

  if (!isShareLinkPlaceholder(invitation)) {
    events.push({
      id: `${invitation.id}-sent`,
      kind: "invitation_sent",
      occurred_at: invitation.created_at,
      title: "Invitation sent",
      description: `${invitationLabel(invitation)} (${invitation.contractor_email})`,
      invitation_id: invitation.id,
      invitation,
    });
  }

  if (invitation.status === "revoked") {
    return events;
  }

  const openedAt =
    invitation.first_accessed_at ?? invitation.last_accessed_at ?? null;

  if (openedAt) {
    events.push({
      id: `${invitation.id}-opened`,
      kind: "invitation_opened",
      occurred_at: openedAt,
      title: "Review link opened",
      description: invitationLabel(invitation),
      invitation_id: invitation.id,
    });
  }

  if (invitation.accepted_at) {
    events.push({
      id: `${invitation.id}-started`,
      kind: "invitation_review_started",
      occurred_at: invitation.accepted_at,
      title: "Review started",
      description: invitationLabel(invitation),
      invitation_id: invitation.id,
    });
  }

  if (invitation.review?.submitted_at) {
    events.push({
      id: `${invitation.id}-submitted`,
      kind: "invitation_review_submitted",
      occurred_at: invitation.review.submitted_at,
      title: "Review submitted",
      description: invitationLabel(invitation),
      invitation_id: invitation.id,
    });
  }

  return events;
}

export async function recordShareLinkView(projectId: string) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("project_share_views")
    .insert({ project_id: projectId });

  if (error && !isMissingTableError(error) && !isMissingColumnError(error)) {
    console.error("Could not record share link view:", error);
  }
}

export async function listProjectActivity(
  projectId: string
): Promise<ProjectActivityItem[]> {
  const supabase = createServiceClient();
  const events: ProjectActivityItem[] = [];

  const invitations = await listInvitationsForProject(projectId);
  for (const invitation of invitations) {
    events.push(...buildInvitationActivity(invitation));
  }

  try {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("share_enabled, share_enabled_at, updated_at")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) throw projectError;

    if (project?.share_enabled) {
      events.push({
        id: `${projectId}-share-created`,
        kind: "share_link_created",
        occurred_at:
          (project.share_enabled_at as string | null) ??
          (project.updated_at as string),
        title: "Share link created",
        description: "Contractor review link is active",
      });
    }

    const { data: shareViews, error: viewsError } = await supabase
      .from("project_share_views")
      .select("viewed_at")
      .eq("project_id", projectId)
      .order("viewed_at", { ascending: false });

    if (viewsError) throw viewsError;

    if (shareViews && shareViews.length > 0) {
      const latestView = shareViews[0].viewed_at as string;
      events.push({
        id: `${projectId}-share-viewed`,
        kind: "share_link_viewed",
        occurred_at: latestView,
        title: "Share link opened",
        description:
          shareViews.length > 1
            ? `Opened ${shareViews.length} times`
            : "Someone opened the review link",
      });
    }
  } catch (error) {
    if (!isMissingTableError(error) && !isMissingColumnError(error)) throw error;
  }

  try {
    const { data: estimates, error: estimatesError } = await supabase
      .from("contractor_estimates")
      .select(
        "id, invitation_id, status, accepted_at, declined_at, contractor_invitations(contractor_name, contractor_company, contractor_email)"
      )
      .eq("project_id", projectId)
      .in("status", ["accepted", "declined"]);

    if (estimatesError) throw estimatesError;

    for (const row of estimates ?? []) {
      const invitation = row.contractor_invitations as {
        contractor_name?: string;
        contractor_company?: string | null;
      } | null;
      const label = invitation?.contractor_company
        ? `${invitation.contractor_name} · ${invitation.contractor_company}`
        : invitation?.contractor_name ?? "Contractor";

      if (row.status === "accepted" && row.accepted_at) {
        events.push({
          id: `${row.id}-accepted`,
          kind: "proposal_accepted",
          occurred_at: row.accepted_at as string,
          title: "Proposal accepted",
          description: label,
          invitation_id: row.invitation_id as string,
        });
      }

      if (row.status === "declined" && row.declined_at) {
        events.push({
          id: `${row.id}-declined`,
          kind: "proposal_declined",
          occurred_at: row.declined_at as string,
          title: "Proposal not selected",
          description: label,
          invitation_id: row.invitation_id as string,
        });
      }
    }
  } catch (error) {
    if (!isMissingTableError(error) && !isMissingColumnError(error)) throw error;
  }

  return events.sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  );
}
