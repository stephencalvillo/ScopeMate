"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionSurface } from "@/components/layout/page-section";
import type { ScopeSuggestionWithMeta } from "@/types";

const TYPE_LABELS = {
  add: "Add scope item",
  edit: "Edit scope item",
  remove: "Remove scope item",
  note: "General note",
} as const;

export function SuggestionCard({
  projectId,
  suggestion,
  onUpdated,
}: {
  projectId: string;
  suggestion: ScopeSuggestionWithMeta;
  onUpdated: () => void;
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

  return (
    <SectionSurface className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
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

      {suggestion.follow_ups && suggestion.follow_ups.length > 0 ? (
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
      ) : null}

      {suggestion.status === "pending" ? (
        showFollowUp ? (
          <div className="space-y-3">
            <Textarea
              value={followUpMessage}
              onChange={(event) => setFollowUpMessage(event.target.value)}
              placeholder="Ask a follow-up question about this suggestion"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={loading !== null || !followUpMessage.trim()}
                onClick={submitFollowUp}
              >
                Send follow-up
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFollowUp(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={loading !== null} onClick={accept}>
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={loading !== null}
              onClick={() => setShowFollowUp(true)}
            >
              Ask follow-up
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={loading !== null}
              onClick={reject}
            >
              Reject
            </Button>
          </div>
        )
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Waiting for contractor response to your follow-up.
        </p>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </SectionSurface>
  );
}
