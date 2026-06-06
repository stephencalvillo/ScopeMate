import { getOwnedProject } from "@/lib/api/project-access";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { ensureProjectShareInvitation } from "@/lib/contractor/project-share";
import { buildShareUrl } from "@/lib/contractor/urls";
import { sendProjectShareLinkEmail } from "@/lib/email/send-contractor-emails";

export async function sendShareLinkEmailForProject({
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

  if (!project.share_enabled || !project.share_token) {
    throw new Error("Create a share link before sending email.");
  }

  await ensureProjectShareInvitation({
    project,
    invitedBy: homeowner.id,
    token: project.share_token,
  });

  const expiresAt = project.share_expires_at
    ? new Date(project.share_expires_at)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await sendProjectShareLinkEmail({
    to: email,
    homeownerName: homeowner.name ?? homeowner.email,
    projectTitle: project.title,
    reviewToken: project.share_token,
    expiresAt,
  });

  return {
    share_url: buildShareUrl(project.share_token, request),
  };
}
