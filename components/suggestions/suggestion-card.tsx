"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionSurface } from "@/components/layout/page-section";
import {
  formatSuggestionHeadline,
  getSuggestionBody,
} from "@/lib/suggestions/display";
import type { ScopeSuggestionWithMeta } from "@/types";

const TYPE_LABELS = {
  add: "Add scope item",
  edit: "Edit scope item",
  remove: "Remove scope item",
  note: "General note",
} as const;

function SuggestionActions({
  suggestion,
  loading,
  showFollowUp,
  followUpMessage,
  error,
  onAccept,
  onReject,
  onShowFollowUp,
  onHideFollowUp,
  onFollowUpMessageChange,
  onSubmitFollowUp,
}: {
  suggestion: ScopeSuggestionWithMeta;
  loading: string | null;
  showFollowUp: boolean;
  followUpMessage: string;
  error: string | null;
  onAccept: () => void;
  onReject: () => void;
  onShowFollowUp: () => void;
  onHideFollowUp: () => void;
  onFollowUpMessageChange: (value: string) => void;
  onSubmitFollowUp: () => void;
}) {
  if (suggestion.status !== "pending") {
    return (
      <p className="text-sm text-[var(--muted)]">
        Waiting for contractor response to your follow-up.
      </p>
    );
  }

  if (showFollowUp) {
    return (
      <div className="space-y-3">
        <Textarea
          value={followUpMessage}
          onChange={(event) => onFollowUpMessageChange(event.target.value)}
          placeholder="Ask a follow-up question about this suggestion"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={loading !== null || !followUpMessage.trim()}
            onClick={onSubmitFollowUp}
          >
            Send follow-up
          </Button>
          <Button size="sm" variant="ghost" onClick={onHideFollowUp}>
            Cancel
          </Button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={loading !== null} onClick={onAccept}>
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading !== null}
          onClick={onShowFollowUp}
        >
          Ask follow-up
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={loading !== null}
          onClick={onReject}
        >
          Reject
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function SuggestionFollowUps({
  suggestion,
}: {
  suggestion: ScopeSuggestionWithMeta;
}) {
  if (!suggestion.follow_ups?.length) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-[8px] bg-neutral-50 p-3">
      {suggestion.follow_ups.map((entry) => (
        <div key={entry.id} className="text-sm">
          <p className="font-medium text-neutral-800">
            {entry.author_role === "homeowner" ? "You asked" : "Contractor replied"}
          </p>
          <p className="text-[var(--muted)]">{entry.message}</p>
        </div>
      ))}
    </div>
  );
}

export function SuggestionCard({
  projectId,
  suggestion,
  onUpdated,
  variant = "default",
  reviewUrl,
}: {
  projectId: string;
  suggestion: ScopeSuggestionWithMeta;
  onUpdated: () => void;
  variant?: "default" | "needs-attention";
  reviewUrl?: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading("accept");
    setError(null);
    const response = await fetch(
      `/api/projects/${projectId}/suggestions/${suggestion.id}/accept`,
      { method: "POST" }
    );
    setLoading(null);
    if (response.ok) {
      onUpdated();
    } else {
      const data = await response.json();
      setError(data.error ?? "Could not accept suggestion.");
    }
  }

  async function reject() {
    setLoading("reject");
    setError(null);
    const response = await fetch(
      `/api/projects/${projectId}/suggestions/${suggestion.id}/reject`,
      { method: "POST" }
    );
    setLoading(null);
    if (response.ok) {
      onUpdated();
    } else {
      const data = await response.json();
      setError(data.error ?? "Could not reject suggestion.");
    }
  }

  async function submitFollowUp() {
    setLoading("follow-up");
    setError(null);
    const response = await fetch(
      `/api/projects/${projectId}/suggestions/${suggestion.id}/follow-up`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: followUpMessage }),
      }
    );
    setLoading(null);
    if (response.ok) {
      setShowFollowUp(false);
      setFollowUpMessage("");
      onUpdated();
    } else {
      const data = await response.json();
      setError(data.error ?? "Could not send follow-up.");
    }
  }

  const actionProps = {
    suggestion,
    loading,
    showFollowUp,
    followUpMessage,
    error,
    onAccept: accept,
    onReject: reject,
    onShowFollowUp: () => setShowFollowUp(true),
    onHideFollowUp: () => setShowFollowUp(false),
    onFollowUpMessageChange: setFollowUpMessage,
    onSubmitFollowUp: submitFollowUp,
  };

  if (variant === "needs-attention") {
    const body = getSuggestionBody(suggestion);

    return (
      <SectionSurface className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm font-medium text-neutral-900">
            {formatSuggestionHeadline(suggestion)}
          </p>
          {reviewUrl ? (
            <Link
              href={reviewUrl}
              className="inline-flex shrink-0 items-center gap-0.5 text-sm text-[var(--muted)] transition-colors hover:text-neutral-900"
            >
              View review
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>

        {body ? (
          <p className="text-sm leading-6 text-neutral-800">{body}</p>
        ) : null}

        <SuggestionFollowUps suggestion={suggestion} />

        <SuggestionActions {...actionProps} />
      </SectionSurface>
    );
  }

  return (
    <SectionSurface className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-neutral-900">
          {TYPE_LABELS[suggestion.suggestion_type]}
        </p>
        {suggestion.contractor_name ? (
          <p className="text-sm text-[var(--muted)]">
            From {suggestion.contractor_name}
          </p>
        ) : null}
        {suggestion.suggested_text ? (
          <p className="text-sm font-medium text-neutral-900">
            {suggestion.suggested_text}
          </p>
        ) : null}
        {suggestion.contractor_note ? (
          <p className="text-sm text-[var(--muted)]">{suggestion.contractor_note}</p>
        ) : null}
      </div>

      <SuggestionFollowUps suggestion={suggestion} />

      <SuggestionActions {...actionProps} />
    </SectionSurface>
  );
}
