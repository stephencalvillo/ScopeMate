import { sendEmailReviewInvitationForProject } from "@/lib/contractor/email-review-invitation";

export async function sendShareLinkEmailForProject({
  projectId,
  email,
  request,
}: {
  projectId: string;
  email: string;
  request?: Request;
}) {
  const result = await sendEmailReviewInvitationForProject({
    projectId,
    email,
    request,
  });

  return {
    share_url: result.review_url,
    invitation: result.invitation,
  };
}
