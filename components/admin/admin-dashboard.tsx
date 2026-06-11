import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import type { AdminStats } from "@/lib/admin/stats";
import {
  countScreensByAudience,
  type ScreenAudience,
} from "@/lib/admin/screen-catalog";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

export function AdminDashboard({
  stats,
  currentAdminUserId,
}: {
  stats: AdminStats;
  currentAdminUserId: string;
}) {
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

        <AdminUsersTable
          users={stats.users.list}
          currentAdminUserId={currentAdminUserId}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl tracking-tight text-neutral-900">
            Screen catalog
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Preview homeowner and contractor pages with mock data.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {(["homeowner", "contractor"] as ScreenAudience[]).map((audience) => (
            <Link key={audience} href={`/adminpanel/screens/${audience}`}>
              <Card className="h-full transition hover:border-neutral-300">
                <CardHeader className="pb-2">
                  <CardDescription>
                    {countScreensByAudience(audience)} screens
                  </CardDescription>
                  <CardTitle className="capitalize">{audience} views</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--muted)]">
                    Browse thumbnails and open interactive previews.
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div>
          <Link
            href="/adminpanel/screens"
            className="text-sm text-neutral-700 underline-offset-4 hover:underline"
          >
            Open full screen catalog
          </Link>
        </div>
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
