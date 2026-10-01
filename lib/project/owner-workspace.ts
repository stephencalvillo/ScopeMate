import { usesCreationWalkthrough } from "@/lib/project/creation-walkthrough";
import type { Project } from "@/types";

type OwnerWorkspaceProject = Pick<
  Project,
  | "homeowner_id"
  | "created_by_user_id"
  | "share_enabled"
  | "creator_role"
  | "creation_completed_at"
>;

/** Signed-in / claimed homeowner project page (not guest accordion, not contractor drafts). */
export function usesOwnerProjectWorkspace(project: OwnerWorkspaceProject) {
  if (usesCreationWalkthrough(project)) return false;
  if (project.creator_role === "contractor") return false;
  return project.homeowner_id !== null;
}
