import { auth } from "@clerk/nextjs/server";
import { getGuestProjectCookie } from "@/lib/auth/guest-project";
import { createServiceClient } from "@/lib/db/supabase";
import { getInvitationByToken } from "@/lib/contractor/invitations";

export function buildHomeownerReviewRedirectPath({
  projectId,
  invitationId,
  reviewSubmitted,
}: {
  projectId: string;
  invitationId: string;
  reviewSubmitted: boolean;
}) {
  if (reviewSubmitted) {
    return `/projects/${projectId}/reviews/${invitationId}`;
  }

  return `/projects/${projectId}`;
}

export async function getHomeownerReviewRedirect(token: string) {
  const { userId } = await auth();
  const guest = await getGuestProjectCookie();

  let invitation;
  try {
    invitation = await getInvitationByToken(token);
  } catch {
    return null;
  }

  if (userId && invitation.contractor_user_id === userId) {
    return null;
  }

  const supabase = createServiceClient();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, homeowner_id, guest_access_token")
    .eq("id", invitation.project_id)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) return null;

  const isSignedInOwner =
    userId != null &&
    project.homeowner_id != null &&
    project.homeowner_id === userId;

  const isGuestOwner =
    project.homeowner_id === null &&
    guest?.projectId === project.id &&
    project.guest_access_token != null &&
    guest?.token === project.guest_access_token;

  if (!isSignedInOwner && !isGuestOwner) {
    return null;
  }

  const { data: review, error: reviewError } = await supabase
    .from("contractor_reviews")
    .select("status")
    .eq("invitation_id", invitation.id)
    .maybeSingle();

  if (reviewError) throw reviewError;

  return buildHomeownerReviewRedirectPath({
    projectId: project.id,
    invitationId: invitation.id,
    reviewSubmitted: review?.status === "submitted",
  });
}
