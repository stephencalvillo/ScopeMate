import { ForbiddenError } from "@/lib/auth/clerk";
import {
  claimContractorClientProjectForHomeowner,
  isContractorCreatedProject,
} from "@/lib/api/project-access";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import { isShareLinkInvitation } from "@/lib/contractor/project-share";
import type { ContractorInvitation, Project, User } from "@/types";

export function isHomeownerShareLinkRecipient(
  project: Pick<Project, "creator_role">
) {
  return isContractorCreatedProject(project);
}

export async function claimContractorClientShareForHomeowner(
  token: string,
  user: User
): Promise<{ project: Project; invitation: ContractorInvitation }> {
  const { invitation, project } = await getReviewProjectByInvitationToken(token);

  if (!isShareLinkInvitation(invitation, project)) {
    throw new ForbiddenError(
      "Only open share links can be claimed from this flow."
    );
  }

  if (!isHomeownerShareLinkRecipient(project)) {
    throw new ForbiddenError(
      "This share link is for contractors reviewing a homeowner project."
    );
  }

  const claimedProject = await claimContractorClientProjectForHomeowner(
    project.id,
    user
  );

  return { project: claimedProject, invitation };
}
