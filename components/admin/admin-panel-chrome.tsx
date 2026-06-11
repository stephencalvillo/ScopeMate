import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function AdminPanelChrome({
  title,
  subtitle,
  backHref = "/adminpanel",
  backLabel = "Back to dashboard",
  children,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
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
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className="hidden text-sm text-neutral-700 underline-offset-4 hover:underline sm:inline"
            >
              {backLabel}
            </Link>
            <Link
              href="/"
              className="inline-flex h-9 items-center rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 text-sm text-neutral-700 transition hover:bg-neutral-50"
            >
              View site
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-[var(--page-padding-x)] py-8">
        {children}
      </main>
    </div>
  );
}
