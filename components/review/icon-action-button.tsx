"use client";

import { Loader2 } from "lucide-react";
import { cn, hoverRevealOnDesktopClassName } from "@/lib/utils";

export function IconActionButton({
  label,
  onClick,
  disabled,
  loading,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const isDisabled = disabled || loading;

  return (
    <span className={cn("group/icon relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        disabled={isDisabled}
        onClick={onClick}
        className={cn(
          "rounded-full p-1.5 text-neutral-600 transition-colors",
          hoverRevealOnDesktopClassName,
          "hover:bg-white hover:text-neutral-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          children
        )}
      </button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap",
          "rounded-[6px] bg-neutral-900 px-2 py-1 text-xs font-medium text-white shadow-sm",
          "opacity-0 transition-opacity duration-150",
          "group-hover/icon:opacity-100 group-focus-within/icon:opacity-100"
        )}
      >
        {label}
      </span>
    </span>
  );
}
