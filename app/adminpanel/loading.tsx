import { Loader2 } from "lucide-react";

export default function AdminPanelLoading() {
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
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col items-center justify-center px-[var(--page-padding-x)] py-24">
        <Loader2
          className="h-8 w-8 animate-spin text-neutral-900"
          aria-hidden
        />
        <p className="mt-4 text-sm text-[var(--muted)]">Loading admin dashboard…</p>
      </main>
    </div>
  );
}
