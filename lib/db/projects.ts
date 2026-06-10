import { recordShareLinkView } from "@/lib/contractor/activity";
import { getAccessibleProject } from "@/lib/api/project-access";
import { isMissingColumnError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import { enrichProjectLocation, enrichProjectsLocation } from "@/lib/location/resolve";
import { enrichScopeItemsWithContractorAttribution } from "@/lib/scope/contractor-attribution";
import type { Project, ProjectWithScope, ScopeItem } from "@/types";

async function loadProjectWithScope(project: Project): Promise<ProjectWithScope> {
  const supabase = createServiceClient();
  const { data: scopeItemsData, error: scopeError } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", project.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (scopeError) throw scopeError;

  const scopeItems = await enrichScopeItemsWithContractorAttribution(
    (scopeItemsData ?? []) as ScopeItem[]
  );

  return enrichProjectLocation(
    {
      ...project,
      scope_items: scopeItems,
    },
    { persist: true }
  );
}

export async function listProjectsForUser(userId: string): Promise<Project[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("homeowner_id", userId)
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return enrichProjectsLocation((data ?? []) as Project[]);
}

export async function listContractorClientProjects(
  userId: string
): Promise<Project[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("created_by_user_id", userId)
    .eq("creator_role", "contractor")
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  if (error && isMissingColumnError(error)) {
    return [];
  }

  if (error) throw error;
  return enrichProjectsLocation((data ?? []) as Project[]);
}

export async function getProjectForUser(
  projectId: string,
  userId: string
): Promise<ProjectWithScope | null> {
  const supabase = createServiceClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("homeowner_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!project) return null;

  return loadProjectWithScope(project as Project);
}

export async function getAccessibleProjectWithScope(
  projectId: string,
  options?: { guestToken?: string | null }
): Promise<ProjectWithScope | null> {
  try {
    const project = await getAccessibleProject(projectId, options);
    return loadProjectWithScope(project);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AuthError" ||
        error.name === "ForbiddenError" ||
        error.name === "NotFoundError")
    ) {
      return null;
    }

    throw error;
  }
}

export async function getProjectByShareToken(
  token: string
): Promise<ProjectWithScope | null> {
  const supabase = createServiceClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("share_token", token)
    .eq("share_enabled", true)
    .maybeSingle();

  if (error) throw error;
  if (!project) return null;

  if (
    project.share_expires_at &&
    new Date(project.share_expires_at) < new Date()
  ) {
    return null;
  }

  const { data: scopeItems, error: scopeError } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", project.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (scopeError) throw scopeError;

  await recordShareLinkView(project.id);

  return enrichProjectLocation(
    {
      ...(project as Project),
      scope_items: (scopeItems ?? []) as ScopeItem[],
    },
    { persist: true }
  );
}
