import {
  AuthError,
  ensureUserRecord,
  ForbiddenError,
  NotFoundError,
  resolveClerkUserId,
  resolveClerkUserIdFromHeaders,
} from "@/lib/auth/clerk";
import { getGuestProjectCookie } from "@/lib/auth/guest-project";
import { createServiceClient } from "@/lib/db/supabase";
import { isMissingColumnError } from "@/lib/db/errors";
import { getContractorProfile } from "@/lib/contractor/profile";
import type { Project, ProjectCreatorRole } from "@/types";

export function projectCreatorRole(
  project: Pick<Project, "creator_role">
): ProjectCreatorRole {
  return project.creator_role ?? "homeowner";
}

export function isContractorCreatedProject(
  project: Pick<Project, "creator_role">
) {
  return projectCreatorRole(project) === "contractor";
}

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

async function resolveGuestProjectForClaim(
  projectId: string,
  guestToken?: string | null
): Promise<Project> {
  const project = await fetchProject(projectId);

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  if (project.homeowner_id !== null) {
    return project;
  }

  const cookie = await getGuestProjectCookie();
  if (
    cookie?.projectId === projectId &&
    cookie.token === project.guest_access_token
  ) {
    return project;
  }

  if (
    guestToken &&
    project.guest_access_token &&
    project.guest_access_token === guestToken
  ) {
    return project;
  }

  throw new ForbiddenError("You do not have access to this project.");
}

function guestTokenMatchesProject(
  project: Project,
  guestToken: string | null | undefined
) {
  return (
    Boolean(guestToken) &&
    Boolean(project.guest_access_token) &&
    project.guest_access_token === guestToken
  );
}

async function resolveProjectAccessUserId(options?: {
  request?: Request;
}): Promise<string | null> {
  if (options?.request) {
    const userId = await resolveClerkUserId(options.request);
    if (userId) {
      return userId;
    }
  }

  return resolveClerkUserIdFromHeaders();
}

export async function getAccessibleProject(
  projectId: string,
  options?: { guestToken?: string | null; request?: Request }
): Promise<Project> {
  const guestToken = options?.guestToken?.trim() || null;
  const userId = await resolveProjectAccessUserId(options);

  if (userId) {
    const project = await fetchProject(projectId);

    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    if (project.homeowner_id === userId) {
      return project;
    }

    if (project.created_by_user_id === userId) {
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

      if (guestTokenMatchesProject(project, guestToken)) {
        return project;
      }
    }

    throw new ForbiddenError("You do not have access to this project.");
  }

  const guest = await getGuestProjectCookie();
  if (guest?.projectId === projectId) {
    return verifyGuestProjectAccess(projectId, guest.token);
  }

  if (guestToken) {
    return verifyGuestProjectAccess(projectId, guestToken);
  }

  throw new AuthError("You need to sign in to continue.");
}

export async function getOwnedProject(
  projectId: string,
  request?: Request
): Promise<Project> {
  const user = await ensureUserRecord(request);
  const project = await fetchProject(projectId);

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  if (project.homeowner_id === user.id) {
    return project;
  }

  if (project.created_by_user_id === user.id) {
    return project;
  }

  throw new ForbiddenError("You do not have access to this project.");
}

export async function claimContractorClientProjectForHomeowner(
  projectId: string,
  user?: Awaited<ReturnType<typeof ensureUserRecord>>,
  request?: Request
): Promise<Project> {
  const resolvedUser = user ?? (await ensureUserRecord(request));
  const project = await fetchProject(projectId);

  if (!project) {
    throw new NotFoundError("Project not found.");
  }

  if (!isContractorCreatedProject(project)) {
    throw new ForbiddenError(
      "Only contractor client projects can be claimed as a homeowner."
    );
  }

  if (project.homeowner_id === resolvedUser.id) {
    return project;
  }

  if (project.homeowner_id !== null) {
    throw new ForbiddenError("This project already belongs to another account.");
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      homeowner_id: resolvedUser.id,
      guest_access_token: null,
    })
    .eq("id", projectId)
    .is("homeowner_id", null)
    .select("*")
    .single();

  if (error) throw error;
  return data as Project;
}

export async function claimGuestProject(
  projectId: string,
  options?: { guestToken?: string | null; request?: Request }
): Promise<Project> {
  const user = await ensureUserRecord(options?.request);
  const project = await resolveGuestProjectForClaim(
    projectId,
    options?.guestToken
  );

  if (project.homeowner_id === user.id) {
    return project;
  }

  if (project.homeowner_id !== null) {
    throw new ForbiddenError("This project already belongs to another account.");
  }

  if (isContractorCreatedProject(project)) {
    throw new ForbiddenError(
      "Use the contractor or homeowner claim flow for this project."
    );
  }

  if (project.created_by_user_id && project.created_by_user_id !== user.id) {
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

export async function claimContractorGuestProject(
  projectId: string,
  options?: { guestToken?: string | null; request?: Request }
): Promise<Project> {
  const user = await ensureUserRecord(options?.request);
  const project = await resolveGuestProjectForClaim(
    projectId,
    options?.guestToken
  );

  if (!isContractorCreatedProject(project)) {
    throw new ForbiddenError("This project is not a contractor client project.");
  }

  if (project.created_by_user_id === user.id) {
    return project;
  }

  if (project.homeowner_id !== null) {
    throw new ForbiddenError("This project already belongs to another account.");
  }

  if (project.created_by_user_id && project.created_by_user_id !== user.id) {
    throw new ForbiddenError("This project already belongs to another account.");
  }

  const profile = await getContractorProfile(user.id);
  if (!profile) {
    throw new ForbiddenError(
      "Create a contractor account to save this project."
    );
  }

  const supabase = createServiceClient();
  let { data, error } = await supabase
    .from("projects")
    .update({
      created_by_user_id: user.id,
      guest_access_token: null,
    })
    .eq("id", projectId)
    .is("homeowner_id", null)
    .select("*")
    .single();

  if (error && isMissingColumnError(error)) {
    throw new ForbiddenError(
      "Contractor projects require migration 017_contractor_created_projects.sql."
    );
  }

  if (error) throw error;
  return data as Project;
}
