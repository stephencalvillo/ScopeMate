import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminAccountType, AdminStats } from "@/lib/admin/stats";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      {detail ? (
        <CardContent>
          <p className="text-sm text-[var(--muted)]">{detail}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

function accountTypeLabel(type: AdminAccountType) {
  switch (type) {
    case "both":
      return "Homeowner + Contractor";
    case "contractor":
      return "Contractor";
    default:
      return "Homeowner";
  }
}

function accountTypeBadgeVariant(type: AdminAccountType) {
  switch (type) {
    case "both":
      return "info" as const;
    case "contractor":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminDashboard({ stats }: { stats: AdminStats }) {
  const statusEntries = Object.entries(stats.projects.byStatus).sort(
    ([, left], [, right]) => right - left
  );

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl tracking-tight text-neutral-900">
            Overview
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Snapshot of users, projects, and contractor activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total users"
            value={stats.users.total}
            detail={`${stats.users.recentSignups} joined in the last 7 days`}
          />
          <StatCard
            label="Homeowner projects"
            value={stats.projects.byCreatorRole.homeowner}
            detail={`${stats.projects.recentProjects} projects created in the last 7 days`}
          />
          <StatCard
            label="Contractor projects"
            value={stats.projects.byCreatorRole.contractor}
            detail={`${stats.contractors.profiles} contractor profiles`}
          />
          <StatCard
            label="Guest projects"
            value={stats.projects.guest}
            detail="Unclaimed drafts started before signup"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl tracking-tight text-neutral-900">
            Users
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {stats.users.homeowners} homeowners, {stats.users.contractors}{" "}
            contractors, {stats.users.both} with both roles.
          </p>
        </div>

        <Card>
          <CardContent className="overflow-x-auto pt-[var(--card-padding)]">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Account type</th>
                  <th className="px-3 py-3 font-medium">Projects</th>
                  <th className="px-3 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.list.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    <td className="px-3 py-3 text-neutral-900">
                      {user.name || "—"}
                    </td>
                    <td className="px-3 py-3 text-neutral-700">{user.email}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={accountTypeBadgeVariant(user.accountType)}>
                          {accountTypeLabel(user.accountType)}
                        </Badge>
                        {user.accountType !== "homeowner" ? (
                          <Badge
                            variant={
                              user.contractorOnboarded ? "success" : "pending"
                            }
                          >
                            {user.contractorOnboarded
                              ? "Onboarded"
                              : "Setup incomplete"}
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-neutral-700">
                      {user.projectCount}
                    </td>
                    <td className="px-3 py-3 text-neutral-700">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project status</CardTitle>
            <CardDescription>
              {stats.projects.total} total projects in ScopeBuddy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusEntries.length > 0 ? (
              statusEntries.map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="capitalize text-neutral-700">
                    {status.replaceAll("_", " ")}
                  </span>
                  <span className="font-medium text-neutral-900">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No projects yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contractor activity</CardTitle>
            <CardDescription>
              Collaboration and estimate metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <MetricRow
              label="Contractor profiles"
              value={stats.contractors.profiles}
            />
            <MetricRow
              label="Onboarded contractors"
              value={stats.contractors.onboarded}
            />
            <MetricRow
              label="Invitations sent"
              value={stats.contractors.invitationsSent}
            />
            <MetricRow
              label="Estimates submitted"
              value={stats.contractors.estimatesSubmitted}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-neutral-700">{label}</span>
      <span className={cn("font-medium text-neutral-900")}>{value}</span>
    </div>
  );
}
