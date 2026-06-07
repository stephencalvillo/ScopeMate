import { VerificationBadge } from "@/components/scope/verification-badge";
import { getScopeItemAttribution } from "@/components/scope/scope-item-shell";
import type { ScopeItem } from "@/types";

export function ScopeItemContent({
  item,
  actions,
  showAttribution = true,
  compact = false,
}: {
  item: ScopeItem;
  actions?: React.ReactNode;
  showAttribution?: boolean;
  compact?: boolean;
}) {
  const attribution = getScopeItemAttribution(item, { showAttribution });

  return (
    <div className="w-full min-w-0 flex-1 space-y-1">
      <div className="flex w-full items-center gap-3">
        <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-neutral-900">
          {item.text}
        </p>
        {actions ? (
          <div className="ml-auto flex shrink-0 items-center">{actions}</div>
        ) : null}
      </div>
      {item.needs_verification ? <VerificationBadge /> : null}
      {attribution ? (
        <p className="text-xs text-[var(--muted)]">{attribution}</p>
      ) : null}
    </div>
  );
}
