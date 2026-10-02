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
  title = "Edit summary",
  actionLabel = "Save",
}: {
  summary: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedSummary: string) => void | Promise<void>;
  title?: string;
  actionLabel?: string;
}) {
  const [draft, setDraft] = useState(summary);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(summary);
      setSaving(false);
      setError(null);
    }
  }, [open, summary]);

  const trimmedDraft = draft.trim();
  const hasChanges =
    trimmedDraft.length > 0 && trimmedDraft !== summary.trim();

  async function handleUpdate() {
    if (!hasChanges || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onUpdate(trimmedDraft);
      onOpenChange(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not save your summary."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-40 text-base"
          placeholder="Describe your project goals and key details..."
          disabled={saving}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            disabled={!hasChanges || saving}
            onClick={() => void handleUpdate()}
          >
            {saving ? "Saving..." : actionLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
