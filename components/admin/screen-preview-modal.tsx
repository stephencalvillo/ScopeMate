"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScreenPreviewFrame } from "@/components/admin/screen-preview-frame";
import { getPreviewPath, type ScreenCatalogEntry } from "@/lib/admin/screen-catalog";

export function ScreenPreviewModal({
  screen,
  onClose,
}: {
  screen: ScreenCatalogEntry | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={screen != null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex w-[calc(100%-1rem)] max-h-[92dvh] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100%-2rem)]">
        {screen ? (
          <>
            <DialogHeader className="border-b border-[var(--border)] px-6 py-4 pr-14">
              <DialogTitle>{screen.title}</DialogTitle>
              <DialogDescription className="space-y-1">
                <span className="block">{screen.description}</span>
                <span className="block text-xs">
                  Production path:{" "}
                  <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-800">
                    {screen.productionPath}
                  </code>
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-hidden bg-[var(--background)] p-4 sm:p-5">
              <ScreenPreviewFrame
                previewPath={getPreviewPath(screen.id)}
                title={screen.title}
                iframeClassName="h-[min(72dvh,780px)] w-full"
              />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
