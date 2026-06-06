import {
  ensureUserRecord,
  ForbiddenError,
  NotFoundError,
} from "@/lib/auth/clerk";
import { createServiceClient } from "@/lib/db/supabase";
import type { Project } from "@/types";

export async function getOwnedProject(projectId: string): Promise<Project> {
  const user = await ensureUserRecord();
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("Project not found.");
  if (data.homeowner_id !== user.id) {
    throw new ForbiddenError("You do not have access to this project.");
  }

  return data as Project;
}
