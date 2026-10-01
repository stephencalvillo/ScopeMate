import type { ReactNode } from "react";
import { VerificationBadge } from "@/components/scope/verification-badge";
import { getScopeItemAttribution } from "@/components/scope/scope-item-shell";
import { cn } from "@/lib/utils";
import type { ScopeItem } from "@/types";

/** Matches the category header icon (h-4 w-4) so bullets sit in the same column. */
export const SCOPE_LIST_MARKER_COLUMN_CLASSNAME =
  "flex h-6 w-4 shrink-0 items-center justify-center";

export function ScopeItemBullet({ className }: { className?: string }) {
  return (
    <span
      className={cn(SCOPE_LIST_MARKER_COLUMN_CLASSNAME, className)}
      aria-hidden
    >
      <span className="h-1 w-1 rounded-full bg-neutral-400" />
    </span>
  );
}

export function ScopeListTextIndent({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function ScopeItemContent({
  item,
  actions,
  showAttribution = true,
  showBullet = false,
}: {
  item: ScopeItem;
  actions?: React.ReactNode;
  showAttribution?: boolean;
  showBullet?: boolean;
  compact?: boolean;
}) {
  const attribution = getScopeItemAttribution(item, { showAttribution });
  const meta = (
    <>
      {item.needs_verification ? <VerificationBadge /> : null}
      {attribution ? (
        <p className="text-xs text-[var(--muted)]">{attribution}</p>
      ) : null}
    </>
  );

  return (
    <div className="w-full min-w-0 flex-1 space-y-1">
      <div
        className={cn(
          "flex w-full gap-3",
          showBullet ? "items-start" : "items-center"
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {showBullet ? <ScopeItemBullet /> : null}
          {showBullet ? (
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium leading-6 text-neutral-900">
                {item.text}
              </p>
              {meta}
            </div>
          ) : (
            <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-neutral-900">
              {item.text}
            </p>
          )}
        </div>
        {actions ? (
          <div className="ml-auto flex shrink-0 items-center">{actions}</div>
        ) : null}
      </div>
      {showBullet ? null : meta}
    </div>
  );
}
