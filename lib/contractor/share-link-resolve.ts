import "server-only";

import { cookies } from "next/headers";
import {
  NotFoundError,
  resolveClerkUserId,
  resolveClerkUserIdFromHeaders,
} from "@/lib/auth/clerk";
import { INVITATION_EXPIRY_DAYS, REVIEW_SESSION_COOKIE } from "@/lib/contractor/constants";
import {
  ensureProjectShareInvitation,
  SHARE_LINK_PLACEHOLDER_EMAIL,
  SHARE_LINK_PLACEHOLDER_NAME,
} from "@/lib/contractor/project-share";
import { verifyReviewSessionValue } from "@/lib/contractor/review-session";
import { createServiceClient } from "@/lib/db/supabase";
import { generateShareToken } from "@/lib/security/tokens";
import type {
  ContractorInvitation,
  ContractorReview,
  Project,
} from "@/types";

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function resolveShareExpiry(project: Pick<Project, "share_expires_at">): Date {
  if (project.share_expires_at) {
    return new Date(project.share_expires_at);
  }

  return addDays(new Date(), INVITATION_EXPIRY_DAYS);
}

function normalizeReviewRecord(
  review: ContractorReview | ContractorReview[] | null | undefined
) {
  if (!review) return null;
  return Array.isArray(review) ? review[0] ?? null : review;
}

function shareInvitationInUse(
  invitation: ContractorInvitation,
  review: ContractorReview | null
) {
  if (invitation.contractor_user_id) return true;
  if (review?.status === "submitted") return true;
  if (invitation.accepted_at) return true;
  if (invitation.status !== "pending") return true;
  return false;
}

async function resolveShareLinkViewerUserId(request?: Request) {
  return (
    (request ? await resolveClerkUserId(request) : null) ??
    (await resolveClerkUserIdFromHeaders())
  );
}

async function findShareInvitationByReviewSession(projectId: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get(REVIEW_SESSION_COOKIE)?.value;
  if (!session) return null;

  const sessionToken = session.split(".")[0];
  if (!sessionToken || !verifyReviewSessionValue(session, sessionToken)) {
    return null;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contractor_invitations")
    .select("*")
    .eq("project_id", projectId)
    .eq("invitation_token", sessionToken)
    .maybeSingle();

  if (error) throw error;
  return (data as ContractorInvitation | null) ?? null;
}

async function findShareInvitationForSignedInUser(
  projectId: string,
  shareToken: string,
  userId: string
) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contractor_invitations")
    .select("*")
    .eq("project_id", projectId)
    .eq("contractor_user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as ContractorInvitation[];
  return (
    rows.find((row) => row.invitation_token === shareToken) ??
    rows[0] ??
    null
  );
}

export async function createShareLinkForkInvitation({
  project,
  invitedBy,
}: {
  project: Project;
  invitedBy: string;
}): Promise<ContractorInvitation> {
  const supabase = createServiceClient();
  const token = generateShareToken();
  const expiresAt = resolveShareExpiry(project);

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
}

export async function resolveShareLinkInvitationForViewer(
  project: Project,
  shareToken: string,
  request?: Request
): Promise<ContractorInvitation> {
  if (!project.share_enabled || project.share_token !== shareToken) {
    throw new NotFoundError("This review link is not available.");
  }

  if (
    project.share_expires_at &&
    new Date(project.share_expires_at) < new Date()
  ) {
    throw new NotFoundError("This review link is not available.");
  }

  const invitedBy =
    project.homeowner_id ?? project.created_by_user_id ?? "";
  const canonical = await ensureProjectShareInvitation({
    project,
    invitedBy,
    token: shareToken,
  });

  const userId = await resolveShareLinkViewerUserId(request);
  if (userId) {
    const owned = await findShareInvitationForSignedInUser(
      project.id,
      shareToken,
      userId
    );
    if (owned) return owned;
  }

  const sessionInvitation = await findShareInvitationByReviewSession(project.id);
  if (sessionInvitation) {
    return sessionInvitation;
  }

  const supabase = createServiceClient();
  const { data: reviewRow, error: reviewError } = await supabase
    .from("contractor_reviews")
    .select("*")
    .eq("invitation_id", canonical.id)
    .maybeSingle();

  if (reviewError) throw reviewError;

  if (
    !shareInvitationInUse(
      canonical,
      normalizeReviewRecord(reviewRow as ContractorReview | null)
    )
  ) {
    return canonical;
  }

  return createShareLinkForkInvitation({ project, invitedBy });
}
