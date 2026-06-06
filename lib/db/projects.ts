import { recordShareLinkView } from "@/lib/contractor/activity";
import { createServiceClient } from "@/lib/db/supabase";
import { enrichProjectLocation, enrichProjectsLocation } from "@/lib/location/resolve";
import { enrichScopeItemsWithContractorAttribution } from "@/lib/scope/contractor-attribution";
import type { Project, ProjectWithScope, ScopeItem } from "@/types";

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

  const { data: scopeItemsData, error: scopeError } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", projectId)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (scopeError) throw scopeError;

  const scopeItems = await enrichScopeItemsWithContractorAttribution(
    (scopeItemsData ?? []) as ScopeItem[]
  );

  return enrichProjectLocation(
    {
      ...(project as Project),
      scope_items: scopeItems,
    },
    { persist: true }
  );
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
