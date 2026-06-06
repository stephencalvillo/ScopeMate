import { NotFoundError } from "@/lib/auth/clerk";
import { INVITATION_EXPIRY_DAYS } from "@/lib/contractor/constants";
import { buildReviewUrl } from "@/lib/contractor/urls";
import { isMissingTableError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import { sendContractorInvitationEmail } from "@/lib/email/send-contractor-emails";
import { generateShareToken } from "@/lib/security/tokens";
import type {
  ContractorInvitation,
  ContractorInvitationWithReview,
  ContractorReview,
  Project,
  ProjectWithScope,
  User,
} from "@/types";

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
        ...invitation,
        review: review ?? null,
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
  token: string
): Promise<ContractorInvitation> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("contractor_invitations")
    .select("*")
    .eq("invitation_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("This review link is not available.");

  const invitation = normalizeInvitationStatus(data as ContractorInvitation);

  if (invitation.status === "revoked" || invitation.status === "expired") {
    throw new NotFoundError("This review link is not available.");
  }

  return invitation;
}

export async function getReviewProjectByInvitationToken(
  token: string
): Promise<{
  invitation: ContractorInvitation;
  review: ContractorReview;
  project: ProjectWithScope;
}> {
  const invitation = await getInvitationByToken(token);
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

  await supabase
    .from("contractor_invitations")
    .update({
      last_accessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", invitation.id);

  return {
    invitation,
    review: review as ContractorReview,
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
}: {
  token: string;
  contractorName: string;
  contractorEmail: string;
  contractorCompany?: string;
}) {
  const invitation = await getInvitationByToken(token);
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("contractor_invitations")
    .update({
      contractor_name: contractorName,
      contractor_email: contractorEmail.toLowerCase(),
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
