import { INVITATION_EXPIRY_DAYS } from "@/lib/contractor/constants";
import { isMissingTableError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import type { ContractorInvitation, Project } from "@/types";

export const SHARE_LINK_PLACEHOLDER_NAME = "Contractor";
export const SHARE_LINK_PLACEHOLDER_EMAIL = "shared@link.scopebuddy";

export function isShareLinkPlaceholder(invitation: {
  contractor_email: string;
}) {
  return invitation.contractor_email === SHARE_LINK_PLACEHOLDER_EMAIL;
}

export function isShareLinkInvitation(
  invitation: Pick<ContractorInvitation, "contractor_email" | "invitation_token">,
  project: Pick<Project, "share_token">
) {
  return (
    isShareLinkPlaceholder(invitation) ||
    (Boolean(project.share_token) &&
      invitation.invitation_token === project.share_token)
  );
}

export function shareLinkInvitationIsActive(
  invitation: Pick<ContractorInvitation, "invitation_token" | "contractor_email">,
  project: Pick<Project, "share_enabled" | "share_token">
) {
  return (
    project.share_enabled &&
    Boolean(project.share_token) &&
    isShareLinkInvitation(invitation, project)
  );
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function resolveShareExpiry(
  project: Pick<Project, "share_expires_at">
): Date {
  if (project.share_expires_at) {
    return new Date(project.share_expires_at);
  }

  return addDays(new Date(), INVITATION_EXPIRY_DAYS);
}

export async function ensureProjectShareInvitation({
  project,
  invitedBy,
  token,
}: {
  project: Project;
  invitedBy: string;
  token: string;
}) {
  const supabase = createServiceClient();
  const expiresAt = resolveShareExpiry(project);

  try {
    const { data: existing, error: existingError } = await supabase
      .from("contractor_invitations")
      .select("id")
      .eq("project_id", project.id)
      .eq("invitation_token", token)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from("contractor_invitations")
        .update({
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updateError) throw updateError;
      return updated as ContractorInvitation;
    }

    const { data: invitation, error: insertError } = await supabase
      .from("contractor_invitations")
      .insert({
        project_id: project.id,
        invited_by: invitedBy,
        contractor_name: SHARE_LINK_PLACEHOLDER_NAME,
        contractor_email: SHARE_LINK_PLACEHOLDER_EMAIL,
        invitation_token: token,
        expires_at: expiresAt.toISOString(),
      })
      .select("*")
      .single();

    if (insertError) throw insertError;

    const { error: reviewError } = await supabase.from("contractor_reviews").insert({
      project_id: project.id,
      invitation_id: invitation.id,
    });

    if (reviewError) throw reviewError;

    return invitation as ContractorInvitation;
  } catch (error) {
    if (isMissingTableError(error)) {
      throw error;
    }
    throw error;
  }
}

export async function ensureShareInvitationForToken(token: string) {
  const supabase = createServiceClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("share_token", token)
    .eq("share_enabled", true)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) return null;

  if (
    project.share_expires_at &&
    new Date(project.share_expires_at) < new Date()
  ) {
    return null;
  }

  return ensureProjectShareInvitation({
    project: project as Project,
    invitedBy: project.homeowner_id ?? project.created_by_user_id ?? "",
    token,
  });
}

export async function revokeShareLinkInvitations(
  projectId: string,
  shareToken: string | null | undefined
) {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  try {
    if (shareToken) {
      await supabase
        .from("contractor_invitations")
        .update({
          status: "revoked",
          updated_at: now,
        })
        .eq("project_id", projectId)
        .eq("invitation_token", shareToken)
        .neq("status", "revoked");
    }

    await supabase
      .from("contractor_invitations")
      .update({
        status: "revoked",
        updated_at: now,
      })
      .eq("project_id", projectId)
      .eq("contractor_email", SHARE_LINK_PLACEHOLDER_EMAIL)
      .neq("status", "revoked");
  } catch (error) {
    if (!isMissingTableError(error)) throw error;
  }
}

export async function revokeProjectShareInvitation(projectId: string) {
  const supabase = createServiceClient();

  try {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("share_token")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) throw projectError;

    await revokeShareLinkInvitations(projectId, project?.share_token);
  } catch (error) {
    if (!isMissingTableError(error)) throw error;
  }
}

export async function rotateProjectShareInvitation({
  project,
  invitedBy,
  token,
  previousShareToken,
}: {
  project: Project;
  invitedBy: string;
  token: string;
  previousShareToken?: string | null;
}) {
  await revokeShareLinkInvitations(project.id, previousShareToken);
  return ensureProjectShareInvitation({
    project: { ...project, share_token: token },
    invitedBy,
    token,
  });
}
