"use client";

import { cn } from "@/lib/utils";

export function ScreenPreviewFrame({
  previewPath,
  title,
  iframeClassName,
}: {
  previewPath: string;
  title: string;
  iframeClassName?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-white shadow-sm">
      <iframe
        src={previewPath}
        title={`Preview: ${title}`}
        className={cn(
          "h-[min(80vh,900px)] w-full bg-[var(--background)]",
          iframeClassName
        )}
      />
    </div>
  );
}
