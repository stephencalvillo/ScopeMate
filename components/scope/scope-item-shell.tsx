import { cn } from "@/lib/utils";
import type { ScopeItem } from "@/types";

export function scopeItemShellClassName({
  interactive = false,
  className,
}: {
  interactive?: boolean;
  className?: string;
} = {}) {
  return cn(
    "rounded-[4px] bg-neutral-50 px-2 py-1 transition-colors",
    interactive && "group hover:bg-neutral-100",
    className
  );
}

export function ScopeItemShell({
  children,
  interactive = false,
  className,
}: {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <div className={scopeItemShellClassName({ interactive, className })}>
      {children}
    </div>
  );
}

export function getScopeItemAttribution(
  item: ScopeItem,
  { showAttribution = true }: { showAttribution?: boolean } = {}
) {
  if (!showAttribution) return null;

  if (item.follow_up_question_id) {
    return "From your answer";
  }

  if (item.source === "contractor" || item.suggestion_id) {
    return "Suggested by contractor";
  }

  if (item.source === "homeowner") {
    return "Added by you";
  }

  return null;
}
