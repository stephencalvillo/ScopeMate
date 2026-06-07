"use client";

import { useEffect, useRef, useState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
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
      setMessage("Share link is ready. Copy it or send it by email.");
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

  async function sendEmail(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;

    setSendingEmail(true);
    setMessage(null);

    const response = await fetch(
      `/api/projects/${project.id}/share/send-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      }
    );

    setSendingEmail(false);

    if (response.ok) {
      setMessage(`Personal review link sent to ${email.trim()}.`);
      setEmail("");
      return;
    }

    const data = await response.json();
    setMessage(data.error ?? "Could not send email.");
  }

  const isCreating = loading && !shareUrl;

  return (
    <div className="space-y-4">
      <DialogHeader className="mb-0">
        <DialogTitle>Share link</DialogTitle>
        <DialogDescription className="text-[var(--muted)]">
          Share one link so a contractor can review your scope, leave comments,
          and suggest changes. No sign-in required.
        </DialogDescription>
      </DialogHeader>

      {isCreating ? (
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-[8px] bg-neutral-100" />
          <p className="text-sm text-[var(--muted)]">Creating link...</p>
        </div>
      ) : shareEnabled && shareUrl ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-link-url">Review link</Label>
            <Input
              id="share-link-url"
              readOnly
              value={shareUrl}
              className="text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={copyLink} disabled={loading || sendingEmail}>
              Copy link
            </Button>
            <Button
              variant="outline"
              onClick={regenerateShare}
              disabled={loading || sendingEmail}
            >
              Regenerate link
            </Button>
            <Button
              variant="ghost"
              onClick={disableShare}
              disabled={loading || sendingEmail}
            >
              Turn off sharing
            </Button>
          </div>

          <form onSubmit={sendEmail} className="space-y-2 border-t pt-4">
            <Label htmlFor="share-link-email">Or send a personal review link</Label>
            <p className="text-xs text-[var(--muted)]">
              Sends a dedicated link to one contractor. They still confirm their
              name before reviewing.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="share-link-email"
                type="email"
                placeholder="contractor@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={sendingEmail}
              />
              <Button type="submit" disabled={sendingEmail || !email.trim()}>
                {sendingEmail ? "Sending..." : "Send link"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-800">
            Create a link to share your project scope with a contractor for
            review.
          </p>
          <Button onClick={enableShare} disabled={loading}>
            <Link2 className="h-4 w-4" aria-hidden />
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
