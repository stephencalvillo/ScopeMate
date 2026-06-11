import { ForbiddenError, NotFoundError } from "@/lib/auth/clerk";
import { INVITATION_EXPIRY_DAYS } from "@/lib/contractor/constants";
import { recordShareLinkView } from "@/lib/contractor/activity";
import {
  ensureShareInvitationForToken,
  isShareLinkInvitation,
  isShareLinkPlaceholder,
  shareLinkInvitationIsActive,
} from "@/lib/contractor/project-share";
import { resolveShareLinkInvitationForViewer } from "@/lib/contractor/share-link-resolve";
export { isShareLinkPlaceholder };
import { buildReviewUrl } from "@/lib/contractor/urls";
import { parseReviewScopeSnapshot } from "@/lib/contractor/review-scope-snapshot";
import { isMissingTableError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import { sendContractorInvitationEmail } from "@/lib/email/send-contractor-emails";
import { generateShareToken } from "@/lib/security/tokens";
import type {
  ContractorInvitation,
  ContractorInvitationStatus,
  ContractorInvitationWithReview,
  ContractorReview,
  Project,
  ProjectWithScope,
  User,
} from "@/types";

function syncInvitationWithReviewStatus(
  invitation: ContractorInvitation,
  review: ContractorReview | null | undefined
): ContractorInvitation {
  if (
    invitation.status === "closed_out" ||
    invitation.status === "revoked" ||
    invitation.status === "expired"
  ) {
    return invitation;
  }

  if (review?.status === "submitted") {
    return { ...invitation, status: "submitted" satisfies ContractorInvitationStatus };
  }

  return invitation;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function normalizeInvitationStatus(
  invitation: ContractorInvitation
): ContractorInvitation {
  if (
    invitation.status !== "revoked" &&
    invitation.status !== "expired" &&
    new Date(invitation.expires_at) < new Date()
  ) {
    return { ...invitation, status: "expired" };
  }

  return invitation;
}

function normalizeContractorReview(
  review: ContractorReview | null | undefined
): ContractorReview | null {
  if (!review) return null;

  return {
    ...review,
    scope_snapshot: parseReviewScopeSnapshot(review.scope_snapshot),
  };
}

export async function listInvitationsForProject(
  projectId: string
): Promise<ContractorInvitationWithReview[]> {
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from("contractor_invitations")
      .select("*, contractor_reviews(*)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => {
      const invitation = normalizeInvitationStatus(
        row as ContractorInvitation
      );
      const reviewRaw = (row as { contractor_reviews?: ContractorReview | ContractorReview[] | null })
        .contractor_reviews;
      const review = Array.isArray(reviewRaw) ? reviewRaw[0] : reviewRaw;

      return {
        ...syncInvitationWithReviewStatus(invitation, review),
        review,
        review_url: buildReviewUrl(invitation.invitation_token),
      };
    });
  } catch (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
}

export async function createContractorInvitation({
  project,
  homeowner,
  contractorName,
  contractorEmail,
  contractorCompany,
}: {
  project: Project;
  homeowner: User;
  contractorName: string;
  contractorEmail: string;
  contractorCompany?: string;
}) {
  const supabase = createServiceClient();
  const token = generateShareToken();
  const expiresAt = addDays(new Date(), INVITATION_EXPIRY_DAYS);

  const { data: invitation, error } = await supabase
    .from("contractor_invitations")
    .insert({
      project_id: project.id,
      invited_by: homeowner.id,
      contractor_name: contractorName,
      contractor_email: contractorEmail.toLowerCase(),
      contractor_company: contractorCompany ?? null,
      invitation_token: token,
      expires_at: expiresAt.toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;

  const { error: reviewError } = await supabase.from("contractor_reviews").insert({
    project_id: project.id,
    invitation_id: invitation.id,
  });

  if (reviewError) throw reviewError;

  await sendContractorInvitationEmail({
    to: contractorEmail,
    contractorName,
    homeownerName: homeowner.name ?? homeowner.email,
    projectTitle: project.title,
    reviewToken: token,
    expiresAt,
  });

  return {
    ...(invitation as ContractorInvitation),
    review_url: buildReviewUrl(token),
  };
}

export async function revokeContractorInvitation(
  projectId: string,
  invitationId: string
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("contractor_invitations")
    .update({
      status: "revoked",
      updated_at: new Date().toISOString(),
    })
    .eq("id", invitationId)
    .eq("project_id", projectId)
    .select("*")
    .single();

  if (error) throw error;
  if (!data) throw new NotFoundError("Invitation not found.");

  return data as ContractorInvitation;
}

export async function resendContractorInvitation({
  invitation,
  project,
  homeowner,
}: {
  invitation: ContractorInvitation;
  project: Project;
  homeowner: User;
}) {
  if (invitation.status === "revoked") {
    throw new NotFoundError("This invitation is no longer available.");
  }

  await sendContractorInvitationEmail({
    to: invitation.contractor_email,
    contractorName: invitation.contractor_name,
    homeownerName: homeowner.name ?? homeowner.email,
    projectTitle: project.title,
    reviewToken: invitation.invitation_token,
    expiresAt: new Date(invitation.expires_at),
  });
}

export async function getInvitationByToken(
  token: string,
  request?: Request
): Promise<ContractorInvitation> {
  const supabase = createServiceClient();

  const { data: shareProject, error: shareProjectError } = await supabase
    .from("projects")
    .select("*")
    .eq("share_token", token)
    .eq("share_enabled", true)
    .maybeSingle();

  if (shareProjectError) throw shareProjectError;

  let invitation: ContractorInvitation | null = null;

  if (shareProject) {
    invitation = await resolveShareLinkInvitationForViewer(
      shareProject as Project,
      token,
      request
    );
  } else {
    const { data, error } = await supabase
      .from("contractor_invitations")
      .select("*")
      .eq("invitation_token", token)
      .maybeSingle();

    if (error) throw error;
    invitation = data as ContractorInvitation | null;

    if (!invitation) {
      invitation = await ensureShareInvitationForToken(token);
    }
  }

  if (!invitation) {
    throw new NotFoundError("This review link is not available.");
  }

  invitation = normalizeInvitationStatus(invitation);

  if (invitation.status === "revoked" || invitation.status === "expired") {
    throw new NotFoundError("This review link is not available.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("share_enabled, share_token")
    .eq("id", invitation.project_id)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) {
    throw new NotFoundError("This review link is not available.");
  }

  if (
    isShareLinkInvitation(invitation, project as Pick<Project, "share_token">) &&
    !shareLinkInvitationIsActive(
      invitation,
      project as Pick<Project, "share_enabled" | "share_token">
    )
  ) {
    throw new NotFoundError("This review link is not available.");
  }

  return invitation;
}

export async function getReviewProjectByInvitationToken(
  token: string,
  request?: Request
): Promise<{
  invitation: ContractorInvitation;
  review: ContractorReview;
  project: ProjectWithScope;
}> {
  const invitation = await getInvitationByToken(token, request);
  const supabase = createServiceClient();

  const { data: review, error: reviewError } = await supabase
    .from("contractor_reviews")
    .select("*")
    .eq("invitation_id", invitation.id)
    .maybeSingle();

  if (reviewError) throw reviewError;
  if (!review) throw new NotFoundError("This review link is not available.");

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", invitation.project_id)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) throw new NotFoundError("This review link is not available.");

  const { data: scopeItems, error: scopeError } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", project.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (scopeError) throw scopeError;

  const now = new Date().toISOString();

  await supabase
    .from("contractor_invitations")
    .update({
      first_accessed_at: invitation.first_accessed_at ?? now,
      last_accessed_at: now,
      updated_at: now,
    })
    .eq("id", invitation.id);

  if (project.share_enabled && project.share_token === token) {
    await recordShareLinkView(project.id);
  }

  const normalizedReview = normalizeContractorReview(review as ContractorReview)!;

  const { data: freshInvitation, error: freshInvitationError } = await supabase
    .from("contractor_invitations")
    .select("*")
    .eq("id", invitation.id)
    .maybeSingle();

  if (freshInvitationError) throw freshInvitationError;

  const resolvedInvitation = syncInvitationWithReviewStatus(
    normalizeInvitationStatus(
      (freshInvitation ?? invitation) as ContractorInvitation
    ),
    normalizedReview
  );

  return {
    invitation: resolvedInvitation,
    review: normalizedReview,
    project: {
      ...(project as Project),
      scope_items: (scopeItems ?? []) as ProjectWithScope["scope_items"],
    },
  };
}

export async function completeContractorIdentity({
  token,
  contractorName,
  contractorEmail,
  contractorCompany,
  request,
}: {
  token: string;
  contractorName: string;
  contractorEmail: string;
  contractorCompany?: string;
  request?: Request;
}) {
  const invitation = await getInvitationByToken(token, request);
  const normalizedEmail = contractorEmail.trim().toLowerCase();

  if (
    !isShareLinkPlaceholder(invitation) &&
    normalizedEmail !== invitation.contractor_email.trim().toLowerCase()
  ) {
    throw new ForbiddenError(
      "Use the email address this invitation was sent to."
    );
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("contractor_invitations")
    .update({
      contractor_name: contractorName,
      contractor_email: normalizedEmail,
      contractor_company: contractorCompany ?? null,
      accepted_at: invitation.accepted_at ?? now,
      status:
        invitation.status === "pending" ? "in_review" : invitation.status,
      last_accessed_at: now,
      updated_at: now,
    })
    .eq("id", invitation.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ContractorInvitation;
}

export async function getInvitationForProject(
  projectId: string,
  invitationId: string
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("contractor_invitations")
    .select("*")
    .eq("id", invitationId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("Invitation not found.");

  return normalizeInvitationStatus(data as ContractorInvitation);
}
