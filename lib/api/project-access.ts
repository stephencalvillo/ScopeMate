import { auth } from "@clerk/nextjs/server";
import {
  AuthError,
  ensureUserRecord,
  ForbiddenError,
  NotFoundError,
} from "@/lib/auth/clerk";
import { getGuestProjectCookie } from "@/lib/auth/guest-project";
import { createServiceClient } from "@/lib/db/supabase";
import type { Project } from "@/types";

async function fetchProject(projectId: string): Promise<Project | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw error;
  return (data as Project | null) ?? null;
}

async function verifyGuestProjectAccess(
  projectId: string,
  token: string
): Promise<Project> {
  const project = await fetchProject(projectId);

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  if (project.homeowner_id !== null) {
    throw new AuthError("Sign in to access this project.");
  }

  if (!project.guest_access_token || project.guest_access_token !== token) {
    throw new ForbiddenError("You do not have access to this project.");
  }

  return project;
}

export async function getAccessibleProject(projectId: string): Promise<Project> {
  const { userId } = await auth();

  if (userId) {
    const user = await ensureUserRecord();
    const project = await fetchProject(projectId);

    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    if (project.homeowner_id === user.id) {
      return project;
    }

    if (project.homeowner_id === null) {
      const guest = await getGuestProjectCookie();
      if (
        guest?.projectId === projectId &&
        guest.token === project.guest_access_token
      ) {
        return project;
      }
    }

    throw new ForbiddenError("You do not have access to this project.");
  }

  const guest = await getGuestProjectCookie();
  if (!guest || guest.projectId !== projectId) {
    throw new AuthError("You need to sign in to continue.");
  }

  return verifyGuestProjectAccess(projectId, guest.token);
}

export async function getOwnedProject(projectId: string): Promise<Project> {
  const user = await ensureUserRecord();
  const project = await fetchProject(projectId);

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  if (project.homeowner_id !== user.id) {
    throw new ForbiddenError("You do not have access to this project.");
  }

  return project;
}

export async function claimGuestProject(projectId: string): Promise<Project> {
  const user = await ensureUserRecord();
  const project = await getAccessibleProject(projectId);

  if (project.homeowner_id === user.id) {
    return project;
  }

  if (project.homeowner_id !== null) {
    throw new ForbiddenError("This project already belongs to another account.");
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      homeowner_id: user.id,
      guest_access_token: null,
    })
    .eq("id", projectId)
    .is("homeowner_id", null)
    .select("*")
    .single();

  if (error) throw error;
  return data as Project;
}
