import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { AdminStats } from "@/lib/admin/stats";

export function AdminShell({
  stats,
  adminEmail,
  adminUserId,
}: {
  stats: AdminStats;
  adminEmail: string | null;
  adminUserId: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-[var(--page-padding-x)] py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
              ScopeBuddy Admin
            </p>
            <h1 className="font-display text-2xl tracking-tight text-neutral-900">
              Control dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {adminEmail ? (
              <p className="hidden text-sm text-[var(--muted)] sm:block">
                {adminEmail}
              </p>
            ) : null}
            <ButtonLink href="/">View site</ButtonLink>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-[var(--page-padding-x)] py-8">
        <AdminDashboard stats={stats} currentAdminUserId={adminUserId} />
      </main>
    </div>
  );
}

function ButtonLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 text-sm text-neutral-700 transition hover:bg-neutral-50"
    >
      {children}
    </Link>
  );
}
