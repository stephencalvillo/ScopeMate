"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildShareUrl } from "@/lib/contractor/urls";
import type { Project } from "@/types";

export function ShareLinkDialogContent({
  project,
  open = true,
  autoCreate = false,
  onClose,
}: {
  project: Project;
  open?: boolean;
  autoCreate?: boolean;
  onClose?: () => void;
}) {
  const [shareEnabled, setShareEnabled] = useState(project.share_enabled);
  const [shareUrl, setShareUrl] = useState<string | null>(
    project.share_token ? buildShareUrl(project.share_token) : null
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const autoCreateStarted = useRef(false);

  async function enableShare() {
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/projects/${project.id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      setShareEnabled(true);
      setShareUrl(data.share_url);
      setMessage("Share link is ready. It stays active until you turn it off.");
      return true;
    }

    setMessage(data.error ?? "Could not create share link.");
    return false;
  }

  useEffect(() => {
    if (!open) {
      autoCreateStarted.current = false;
      return;
    }

    if (
      !autoCreate ||
      shareEnabled ||
      shareUrl ||
      loading ||
      autoCreateStarted.current
    ) {
      return;
    }

    autoCreateStarted.current = true;
    void enableShare();
  }, [open, autoCreate, shareEnabled, shareUrl, loading]);

  async function disableShare() {
    setLoading(true);
    const response = await fetch(`/api/projects/${project.id}/share`, {
      method: "DELETE",
    });
    setLoading(false);

    if (response.ok) {
      setShareEnabled(false);
      setShareUrl(null);
      setMessage("Share link turned off.");
    }
  }

  async function regenerateShare() {
    setLoading(true);
    const response = await fetch(
      `/api/projects/${project.id}/share/regenerate`,
      { method: "POST" }
    );
    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      setShareUrl(data.share_url);
      setShareEnabled(true);
      setMessage("New link created. The old link no longer works.");
    } else {
      setMessage(data.error ?? "Could not regenerate share link.");
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setMessage("Link copied.");
  }

  const isCreating = loading && !shareUrl;

  return (
    <div className="space-y-4">
      <DialogHeader className="mb-0">
        <DialogTitle>Share link</DialogTitle>
        <p className="text-sm text-[var(--muted)]">
          Anyone with this link can view your scope without signing in.
        </p>
      </DialogHeader>

      {isCreating ? (
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-[8px] bg-neutral-100" />
          <p className="text-sm text-[var(--muted)]">Creating link...</p>
        </div>
      ) : shareEnabled && shareUrl ? (
        <div className="space-y-3">
          <Input readOnly value={shareUrl} className="text-sm" />
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyLink} disabled={loading}>
              Copy link
            </Button>
            <Button
              variant="outline"
              onClick={regenerateShare}
              disabled={loading}
            >
              Regenerate link
            </Button>
            <Button
              variant="ghost"
              onClick={disableShare}
              disabled={loading}
            >
              Turn off sharing
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-800">
            Create a read-only link to share your project scope with a contractor.
          </p>
          <Button onClick={enableShare} disabled={loading}>
            {loading ? "Creating link..." : "Create share link"}
          </Button>
        </div>
      )}

      {message ? (
        <p className="text-sm text-[var(--muted)]">{message}</p>
      ) : null}

      {onClose ? (
        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ShareLinkDialog({
  project,
  open,
  onOpenChange,
  autoCreate = false,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoCreate?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open ? (
          <ShareLinkDialogContent
            project={project}
            open={open}
            autoCreate={autoCreate}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
