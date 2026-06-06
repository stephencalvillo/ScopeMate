"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PreviewSection } from "@/components/design-system/preview-section";

export function DialogPreview() {
  return (
    <PreviewSection title="Default">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete scope item?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--muted)]">
            This removes the item from the project scope. You can add it back
            later if needed.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button variant="destructive">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PreviewSection>
  );
}
