"use client";

import { useState } from "react";
import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

export function ShareLinkPanel({
  project,
  docked = false,
}: {
  project: Project;
  docked?: boolean;
}) {
  const [shareEnabled, setShareEnabled] = useState(project.share_enabled);
  const [shareUrl, setShareUrl] = useState<string | null>(
    project.share_token
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/share/${project.share_token}`
      : null
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
    } else {
      setMessage(data.error ?? "Could not create share link.");
    }
  }

  async function disableShare() {
    setLoading(true);
    const response = await fetch(`/api/projects/${project.id}/share`, {
      method: "DELETE",
    });
    setLoading(false);

    if (response.ok) {
      setShareEnabled(false);
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
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setMessage("Link copied.");
  }

  if (docked) {
    return (
      <SectionSurface
        className={cn(
          "space-y-3 bg-white/95 backdrop-blur-sm",
          shareEnabled && shareUrl ? "p-4" : "p-4 sm:p-5"
        )}
      >
        {shareEnabled && shareUrl ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-900">
              Share link ready
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                readOnly
                value={shareUrl}
                className="h-9 min-w-0 flex-1 text-sm"
              />
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button size="sm" onClick={copyLink} disabled={loading}>
                  Copy link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateShare}
                  disabled={loading}
                >
                  Regenerate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disableShare}
                  disabled={loading}
                >
                  Turn off
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="font-medium text-neutral-900">
                Share with a contractor
              </p>
              <p className="text-sm text-[var(--muted)]">
                Send a read-only link — no sign-in required.
              </p>
            </div>
            <Button
              className="shrink-0"
              onClick={enableShare}
              disabled={loading}
            >
              {loading ? "Creating link..." : "Create share link"}
            </Button>
          </div>
        )}

        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}
      </SectionSurface>
    );
  }

  return (
    <PageSection
      title="Share with a contractor"
      description="Send a read-only link so a contractor can review your scope without signing in. The link stays active until you turn sharing off."
    >
      <SectionSurface className="space-y-4">
        {shareEnabled && shareUrl ? (
          <div className="space-y-3">
            <Input readOnly value={shareUrl} />
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
          <Button onClick={enableShare} disabled={loading}>
            {loading ? "Creating link..." : "Create share link"}
          </Button>
        )}

        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}
      </SectionSurface>
    </PageSection>
  );
}
