import { getOwnedProject } from "@/lib/api/project-access";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { INVITATION_EXPIRY_DAYS } from "@/lib/contractor/constants";
import { SHARE_LINK_PLACEHOLDER_NAME } from "@/lib/contractor/project-share";
import { buildReviewUrl } from "@/lib/contractor/urls";
import { createServiceClient } from "@/lib/db/supabase";
import { sendProjectShareLinkEmail } from "@/lib/email/send-contractor-emails";
import { generateShareToken } from "@/lib/security/tokens";
import type { ContractorInvitation, Project, User } from "@/types";

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function createEmailReviewInvitation({
  project,
  homeowner,
  contractorEmail,
  request,
}: {
  project: Project;
  homeowner: User;
  contractorEmail: string;
  request?: Request;
}) {
  const supabase = createServiceClient();
  const token = generateShareToken();
  const expiresAt = addDays(new Date(), INVITATION_EXPIRY_DAYS);
  const email = contractorEmail.toLowerCase();

  const { data: invitation, error } = await supabase
    .from("contractor_invitations")
    .insert({
      project_id: project.id,
      invited_by: homeowner.id,
      contractor_name: SHARE_LINK_PLACEHOLDER_NAME,
      contractor_email: email,
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

  await sendProjectShareLinkEmail({
    to: email,
    homeownerName: homeowner.name ?? homeowner.email,
    projectTitle: project.title,
    reviewToken: token,
    expiresAt,
  });

  return {
    invitation: invitation as ContractorInvitation,
    review_url: buildReviewUrl(token, request),
  };
}

export async function sendEmailReviewInvitationForProject({
  projectId,
  email,
  request,
}: {
  projectId: string;
  email: string;
  request?: Request;
}) {
  const project = await getOwnedProject(projectId);
  const homeowner = await ensureUserRecord();

  return createEmailReviewInvitation({
    project,
    homeowner,
    contractorEmail: email,
    request,
  });
}
