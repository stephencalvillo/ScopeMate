import { Info } from "lucide-react";

export function VerificationBadge() {
  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
      <Info
        className="h-3.5 w-3.5 shrink-0 text-[var(--accent-foreground)]"
        aria-hidden
      />
      Contractor must verify
    </p>
  );
}
