"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { ContractorEstimateProvider } from "@/components/estimate/contractor-estimate-context";
import { ContractorReviewEstimateBody } from "@/components/review/contractor-review-estimate-body";
import { SharedPhotoGallery } from "@/components/share/shared-photo-gallery";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { formatProjectLocation } from "@/lib/location/parse";
import type { SharedPhoto } from "@/lib/phase2/client";
import {
  formatProjectTypeLabel,
  type ContractorInvitation,
  type ContractorEstimate,
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
  estimate?: ContractorEstimate | null;
};

export function ContractorReviewWorkspace({
  token,
  payload,
  onRefresh,
  onReviewSubmitted,
}: {
  token: string;
  payload: ReviewPayload;
  onRefresh: () => void;
  onReviewSubmitted: () => void | Promise<void>;
}) {
  const { invitation, review, project, photos, estimate = null } = payload;
  const [suggestions, setSuggestions] = useState(payload.suggestions);
  const [notes, setNotes] = useState(review.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const reviewSubmitted = review.status === "submitted";
  const editable = !reviewSubmitted;

  const draftAddSuggestions = useMemo(
    () =>
      suggestions.filter(
        (entry) =>
          entry.suggestion_type === "add" && entry.status === "draft"
      ),
    [suggestions]
  );

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
        <p className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
          <span>{formatProjectTypeLabel(project.project_type)}</span>
          <span aria-hidden>{"\u00b7"}</span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {formatProjectLocation(project)}
          </span>
        </p>
      </div>

      <ScopeSummary summary={project.ai_summary} />

      <SharedPhotoGallery photos={photos} />

      <ContractorEstimateProvider
        token={token}
        scopeItems={project.scope_items}
        editable={editable}
        reviewSubmitted={reviewSubmitted}
        initialEstimate={estimate}
        draftAddSuggestions={draftAddSuggestions}
      >
        <ContractorReviewEstimateBody
          token={token}
          items={project.scope_items}
          suggestions={suggestions}
          editable={editable}
          notes={notes}
          onNotesChange={setNotes}
          onSuggestionsChange={setSuggestions}
          onRefresh={onRefresh}
          onError={setError}
          onReviewSubmitted={onReviewSubmitted}
        />
      </ContractorEstimateProvider>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
