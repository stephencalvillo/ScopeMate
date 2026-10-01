import type { Project } from "@/types";

type WalkthroughProject = Pick<
  Project,
  | "homeowner_id"
  | "created_by_user_id"
  | "share_enabled"
  | "creator_role"
  | "creation_completed_at"
>;

function isContractorProject(project: WalkthroughProject): boolean {
  return project.creator_role === "contractor";
}

function hasFinishedCreation(project: WalkthroughProject): boolean {
  if (project.share_enabled) return true;
  // Missing column / legacy payload: owned projects keep the created page.
  if (typeof project.creation_completed_at === "undefined") {
    return project.homeowner_id !== null;
  }
  return project.creation_completed_at !== null;
}

/**
 * First-time creation walkthrough (accordion, Next/Finish, snapshot).
 * Guests stay here until they claim or share.
 * Signed-in homeowners stay here until they Finish (or share).
 * Existing already-created owned projects use the two-column page.
 */
export function usesCreationWalkthrough(project: WalkthroughProject): boolean {
  if (isContractorProject(project)) return false;
  if (project.share_enabled) return false;
  if (project.homeowner_id === null) return true;
  return !hasFinishedCreation(project);
}
