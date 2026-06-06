"use client";

import { useState } from "react";
import { SharedPhotoGallery } from "@/components/share/shared-photo-gallery";
import { ReviewScopeList } from "@/components/review/review-scope-list";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatProjectLocation } from "@/lib/location/parse";
import type { SharedPhoto } from "@/lib/phase2/client";
import {
  formatProjectTypeLabel,
  type ContractorInvitation,
  type ContractorReview,
  type ProjectWithScope,
  type ScopeSuggestion,
  type SuggestionFollowUp,
} from "@/types";

type ReviewSuggestion = ScopeSuggestion & { follow_ups?: SuggestionFollowUp[] };

type ReviewPayload = {
  invitation: ContractorInvitation;
  review: ContractorReview;
  project: ProjectWithScope;
  photos: SharedPhoto[];
  suggestions: ReviewSuggestion[];
};

export function ContractorReviewWorkspace({
  token,
  payload,
  onRefresh,
}: {
  token: string;
  payload: ReviewPayload;
  onRefresh: () => void;
}) {
  const { invitation, review, project, photos } = payload;
  const [suggestions, setSuggestions] = useState(payload.suggestions);
  const [notes, setNotes] = useState(review.notes ?? "");
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reviewSubmitted = review.status === "submitted";
  const editable = !reviewSubmitted;

  async function completeReview() {
    setCompleting(true);
    setError(null);

    await fetch(`/api/review/${token}/notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });

    const response = await fetch(`/api/review/${token}/complete`, {
      method: "POST",
    });
    setCompleting(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not submit review.");
      return;
    }

    setMessage("Review submitted. The homeowner will be notified.");
    onRefresh();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm text-[var(--muted)]">
          Reviewing as {invitation.contractor_name}
          {invitation.contractor_company
            ? ` · ${invitation.contractor_company}`
            : ""}
        </p>
        <h1 className="font-display text-4xl tracking-tight text-neutral-900">
          {project.title}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {formatProjectTypeLabel(project.project_type)}
        </p>
        <p className="text-sm text-[var(--muted)]">
          {formatProjectLocation(project)}
        </p>
      </div>

      <ScopeSummary summary={project.ai_summary} />

      <PageSection
        title="Scope of work"
        description={
          editable
            ? "Hover an item to comment, or add items within each category."
            : undefined
        }
      >
        <ReviewScopeList
          items={project.scope_items}
          suggestions={suggestions}
          editable={editable}
          token={token}
          onSuggestionsChange={setSuggestions}
          onRefresh={onRefresh}
          onError={setError}
        />
      </PageSection>

      <SharedPhotoGallery photos={photos} />

      <PageSection title="General notes">
        <SectionSurface>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={!editable}
            placeholder="Optional overall feedback for the homeowner"
            rows={4}
          />
        </SectionSurface>
      </PageSection>

      {editable ? (
        <Button disabled={completing} onClick={completeReview}>
          {completing ? "Submitting..." : "Submit review"}
        </Button>
      ) : (
        <p className="text-sm font-medium text-neutral-900">Review submitted</p>
      )}

      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
