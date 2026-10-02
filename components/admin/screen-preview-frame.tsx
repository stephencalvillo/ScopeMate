"use client";

import { cn } from "@/lib/utils";

export function ScreenPreviewFrame({
  previewPath,
  title,
  className,
  iframeClassName,
}: {
  previewPath: string;
  title: string;
  className?: string;
  iframeClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-[8px] border border-[var(--border)] bg-white shadow-sm",
        className
      )}
    >
      <iframe
        key={previewPath}
        src={previewPath}
        title={`Preview: ${title}`}
        className={cn("min-h-0 w-full flex-1 bg-[var(--background)]", iframeClassName)}
      />
    </div>
  );
}
