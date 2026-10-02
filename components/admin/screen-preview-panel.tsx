"use client";

import { X } from "lucide-react";
import { ScreenPreviewFrame } from "@/components/admin/screen-preview-frame";
import { Button } from "@/components/ui/button";
import {
  getPreviewPath,
  type ScreenCatalogEntry,
} from "@/lib/admin/screen-catalog";

export function ScreenPreviewPanel({
  screen,
  onClose,
}: {
  screen: ScreenCatalogEntry;
  onClose: () => void;
}) {
  return (
    <aside className="flex h-1/2 w-full min-w-0 shrink-0 flex-col border-t border-[var(--border)] bg-white shadow-[-16px_0_40px_rgba(23,23,23,0.06)] lg:h-full lg:w-1/2 lg:border-t-0 lg:border-l">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            {screen.category}
          </p>
          <h2 className="mt-1 font-display text-xl tracking-tight text-neutral-900">
            {screen.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{screen.description}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-800">
              {screen.productionPath}
            </code>
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 bg-[var(--background)] p-3 sm:p-4">
        <ScreenPreviewFrame
          previewPath={getPreviewPath(screen.id)}
          title={screen.title}
          className="h-full"
          iframeClassName="h-full"
        />
      </div>
    </aside>
  );
}
