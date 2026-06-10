"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
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
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { getProjectShareCopy } from "@/lib/project/share-copy";
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
  const { getToken } = useAuth();
  const [shareEnabled, setShareEnabled] = useState(project.share_enabled);
  const [shareUrl, setShareUrl] = useState<string | null>(
    project.share_token ? buildShareUrl(project.share_token) : null
  );
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);
  const autoCreateStarted = useRef(false);
  const shareCopy = getProjectShareCopy(project.creator_role === "contractor");

  async function enableShare() {
    setLoading(true);
    setMessage(null);
    setMessageIsError(false);

    const response = await authenticatedFetch(
      getToken,
      `/api/projects/${project.id}/share`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }
    );

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      setShareEnabled(true);
      setShareUrl(data.share_url);
      setMessageIsError(false);
      setMessage("Share link is ready. Copy it or send it by email.");
      return true;
    }

    setMessageIsError(true);
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
    <div>
      <DialogHeader className="mb-0">
        <DialogTitle>Share link</DialogTitle>
        <DialogDescription className="text-[var(--muted)]">
          {shareCopy.description}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-4">
        {isCreating ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-[8px] bg-neutral-100" />
            <p className="text-sm text-[var(--muted)]">Creating link...</p>
          </div>
        ) : shareEnabled && shareUrl ? (
          <div className="space-y-4">
            <Input
              id="share-link-url"
              readOnly
              value={shareUrl}
              aria-label="Share link"
              className="text-sm"
            />

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
              <Label htmlFor="share-link-email">{shareCopy.emailLabel}</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="share-link-email"
                  type="email"
                  placeholder={shareCopy.emailPlaceholder}
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
          <Button onClick={enableShare} disabled={loading}>
            <Link2 className="h-4 w-4" aria-hidden />
            {loading ? "Creating link..." : "Create share link"}
          </Button>
        )}

        {message ? (
          <p
            className={
              messageIsError
                ? "text-sm text-red-600"
                : "text-sm text-[var(--muted)]"
            }
          >
            {message}
          </p>
        ) : null}
      </div>

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
