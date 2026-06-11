"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function UpdateProjectScopeDialog({
  summary,
  open,
  onOpenChange,
  onUpdate,
}: {
  summary: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedSummary: string) => void;
}) {
  const [draft, setDraft] = useState(summary);

  useEffect(() => {
    if (open) {
      setDraft(summary);
    }
  }, [open, summary]);

  const trimmedDraft = draft.trim();
  const hasChanges =
    trimmedDraft.length > 0 && trimmedDraft !== summary.trim();

  function handleUpdate() {
    if (!hasChanges) return;
    onUpdate(trimmedDraft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update project scope</DialogTitle>
        </DialogHeader>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-40 text-base"
          placeholder="Describe your project goals and key details..."
        />

        <div className="flex justify-end pt-2">
          <Button type="button" disabled={!hasChanges} onClick={handleUpdate}>
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
