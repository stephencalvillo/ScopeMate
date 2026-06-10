import { createServiceClient } from "@/lib/db/supabase";

export type AdminAccountType = "homeowner" | "contractor" | "both";

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  accountType: AdminAccountType;
  contractorOnboarded: boolean;
  projectCount: number;
  createdAt: string;
  joinedAt: string;
}

export interface AdminStats {
  users: {
    total: number;
    homeowners: number;
    contractors: number;
    both: number;
    recentSignups: number;
    list: AdminUserRow[];
  };
  projects: {
    total: number;
    byCreatorRole: {
      homeowner: number;
      contractor: number;
    };
    guest: number;
    byStatus: Record<string, number>;
    recentProjects: number;
  };
  contractors: {
    profiles: number;
    onboarded: number;
    invitationsSent: number;
    estimatesSubmitted: number;
  };
}

function resolveAccountType(
  hasContractorProfile: boolean,
  homeownerProjectCount: number
): AdminAccountType {
  if (hasContractorProfile && homeownerProjectCount > 0) {
    return "both";
  }

  if (hasContractorProfile) {
    return "contractor";
  }

  return "homeowner";
}

function countRecent(items: { created_at: string }[], days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((item) => new Date(item.created_at).getTime() >= cutoff)
    .length;
}

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createServiceClient();

  const [
    usersResult,
    profilesResult,
    projectsResult,
    invitationsResult,
    estimatesResult,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("contractor_profiles")
      .select("user_id, onboarding_completed_at"),
    supabase
      .from("projects")
      .select("id, homeowner_id, creator_role, status, created_at"),
    supabase.from("contractor_invitations").select("id", { count: "exact", head: true }),
    supabase
      .from("contractor_estimates")
      .select("id", { count: "exact", head: true })
      .not("submitted_at", "is", null),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (projectsResult.error) throw projectsResult.error;
  if (invitationsResult.error) throw invitationsResult.error;
  if (estimatesResult.error) throw estimatesResult.error;

  const users = usersResult.data ?? [];
  const profiles = profilesResult.data ?? [];
  const projects = projectsResult.data ?? [];

  const profileByUserId = new Map(
    profiles.map((profile) => [profile.user_id, profile])
  );

  const homeownerProjectCounts = new Map<string, number>();
  for (const project of projects) {
    if (!project.homeowner_id) continue;
    homeownerProjectCounts.set(
      project.homeowner_id,
      (homeownerProjectCounts.get(project.homeowner_id) ?? 0) + 1
    );
  }

  const list: AdminUserRow[] = users.map((user) => {
    const profile = profileByUserId.get(user.id);
    const homeownerProjectCount = homeownerProjectCounts.get(user.id) ?? 0;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: resolveAccountType(Boolean(profile), homeownerProjectCount),
      contractorOnboarded: Boolean(profile?.onboarding_completed_at),
      projectCount: homeownerProjectCount,
      createdAt: user.created_at,
      joinedAt: formatAdminDate(user.created_at),
    };
  });

  const byCreatorRole = {
    homeowner: projects.filter((project) => project.creator_role === "homeowner")
      .length,
    contractor: projects.filter((project) => project.creator_role === "contractor")
      .length,
  };

  const byStatus = projects.reduce<Record<string, number>>((counts, project) => {
    counts[project.status] = (counts[project.status] ?? 0) + 1;
    return counts;
  }, {});

  return {
    users: {
      total: users.length,
      homeowners: list.filter((user) => user.accountType === "homeowner").length,
      contractors: list.filter((user) => user.accountType === "contractor").length,
      both: list.filter((user) => user.accountType === "both").length,
      recentSignups: countRecent(users),
      list,
    },
    projects: {
      total: projects.length,
      byCreatorRole,
      guest: projects.filter((project) => !project.homeowner_id).length,
      byStatus,
      recentProjects: countRecent(projects),
    },
    contractors: {
      profiles: profiles.length,
      onboarded: profiles.filter((profile) => profile.onboarding_completed_at)
        .length,
      invitationsSent: invitationsResult.count ?? 0,
      estimatesSubmitted: estimatesResult.count ?? 0,
    },
  };
}
