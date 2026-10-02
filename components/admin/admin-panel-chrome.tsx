import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function AdminPanelChrome({
  title,
  subtitle,
  backHref = "/adminpanel",
  backLabel = "Back to dashboard",
  contentLayout = "contained",
  children,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  contentLayout?: "contained" | "canvas";
  children: React.ReactNode;
}) {
  const isCanvas = contentLayout === "canvas";

  return (
    <div
      className={
        isCanvas
          ? "flex h-dvh flex-col overflow-hidden bg-[var(--background)]"
          : "min-h-screen bg-[var(--background)]"
      }
    >
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--card)]">
        <div
          className={
            isCanvas
              ? "flex w-full items-center justify-between gap-4 px-[var(--page-padding-x)] py-4"
              : "mx-auto flex max-w-7xl items-center justify-between gap-4 px-[var(--page-padding-x)] py-4"
          }
        >
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
              ScopeBuddy Admin
            </p>
            <h1 className="font-display text-2xl tracking-tight text-neutral-900">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{subtitle}</p>
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

      <main
        className={
          isCanvas
            ? "min-h-0 flex-1"
            : "mx-auto max-w-7xl px-[var(--page-padding-x)] py-8"
        }
      >
        {children}
      </main>
    </div>
  );
}
