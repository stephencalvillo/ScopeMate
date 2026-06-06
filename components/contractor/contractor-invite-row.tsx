"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionSurface } from "@/components/layout/page-section";
import {
  formatReviewDate,
  isReviewSubmitted,
} from "@/lib/contractor/review-display";
import {
  CONTRACTOR_INVITATION_STATUS_LABELS,
  type ContractorInvitationWithReview,
} from "@/types";

export function ContractorInviteRow({
  projectId,
  invitation,
  onRevoked,
  onResent,
}: {
  projectId: string;
  invitation: ContractorInvitationWithReview;
  onRevoked: () => void;
  onResent: () => void;
}) {
  const [loading, setLoading] = useState<"copy" | "resend" | "revoke" | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);

  async function copyLink() {
    if (!invitation.review_url) return;
    setLoading("copy");
    await navigator.clipboard.writeText(invitation.review_url);
    setMessage("Review link copied.");
    setLoading(null);
  }

  async function resendInvite() {
    setLoading("resend");
    const response = await fetch(
      `/api/projects/${projectId}/invitations/${invitation.id}/resend`,
      { method: "POST" }
    );
    setLoading(null);

    if (response.ok) {
      onResent();
    } else {
      const data = await response.json();
      setMessage(data.error ?? "Could not resend invitation.");
    }
  }

  async function revokeInvite() {
    setLoading("revoke");
    const response = await fetch(
      `/api/projects/${projectId}/invitations/${invitation.id}`,
      { method: "DELETE" }
    );
    setLoading(null);

    if (response.ok) {
      onRevoked();
    } else {
      const data = await response.json();
      setMessage(data.error ?? "Could not revoke invitation.");
    }
  }

  const expiresLabel = new Date(invitation.expires_at).toLocaleDateString();
  const submitted = isReviewSubmitted(invitation);
  const submittedLabel = formatReviewDate(invitation.review?.submitted_at);
  const statusLabel = submitted
    ? submittedLabel
      ? `Review submitted · ${submittedLabel}`
      : "Review submitted"
    : CONTRACTOR_INVITATION_STATUS_LABELS[invitation.status];

  return (
    <SectionSurface className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {invitation.contractor_name}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {invitation.contractor_email}
          </p>
          {invitation.contractor_company ? (
            <p className="text-sm text-[var(--muted)]">
              {invitation.contractor_company}
            </p>
          ) : null}
        </div>
        <p className="text-sm text-[var(--muted)]">{statusLabel}</p>
      </div>

      <p className="text-xs text-[var(--muted)]">Expires {expiresLabel}</p>

      {invitation.status !== "revoked" && invitation.status !== "expired" ? (
        <div className="space-y-3">
          {invitation.review_url ? (
            <Input readOnly value={invitation.review_url} className="text-sm" />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={loading !== null}
              onClick={copyLink}
            >
              Copy link
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={loading !== null}
              onClick={resendInvite}
            >
              Resend email
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={loading !== null}
              onClick={revokeInvite}
            >
              Revoke
            </Button>
          </div>
        </div>
      ) : null}

      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
    </SectionSurface>
  );
}
