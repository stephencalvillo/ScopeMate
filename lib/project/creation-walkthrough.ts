import type { Project } from "@/types";

type WalkthroughProject = Pick<
  Project,
  "homeowner_id" | "created_by_user_id" | "share_enabled"
>;

/**
 * First-time creation walkthrough (accordion, Next/Finish, snapshot).
 * True only for unclaimed guest drafts — not for projects already
 * attached to an account via share/save, or already-shared projects.
 */
export function usesCreationWalkthrough(project: WalkthroughProject): boolean {
  if (project.share_enabled) return false;
  return project.homeowner_id === null && !project.created_by_user_id;
}
