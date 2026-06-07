"use client";

import { ContractorEstimateBar } from "@/components/estimate/contractor-estimate-bar";
import { useContractorEstimate } from "@/components/estimate/contractor-estimate-context";
import { ApplySavedRatesControl } from "@/components/estimate/apply-saved-rates-control";
import { ScopePricingModeControl } from "@/components/estimate/category-pricing-controls";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { GridLoadingCard } from "@/components/marketing/grid-loading-card";
import { ReviewSubmitActions } from "@/components/review/review-submit-actions";
import { ReviewScopeList } from "@/components/review/review-scope-list";
import { Textarea } from "@/components/ui/textarea";
import type { ScopeItem, ScopeSuggestion, SuggestionFollowUp } from "@/types";

type ReviewSuggestion = ScopeSuggestion & { follow_ups?: SuggestionFollowUp[] };

export function ContractorReviewEstimateBody({
  token,
  items,
  suggestions,
  editable,
  notes,
  onNotesChange,
  onSuggestionsChange,
  onRefresh,
  onError,
  onReviewSubmitted,
}: {
  token: string;
  items: ScopeItem[];
  suggestions: ReviewSuggestion[];
  editable: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSuggestionsChange: (suggestions: ReviewSuggestion[]) => void;
  onRefresh: () => void;
  onError: (message: string) => void;
  onReviewSubmitted: () => void | Promise<void>;
}) {
  const { loading, generating } = useContractorEstimate();
  const isPreparingEstimate = loading || generating;

  return (
    <div className="space-y-8">
      <PageSection
        title="Scope of work and estimate"
        description={
          editable && !isPreparingEstimate
            ? "Comment on items, add suggestions, and optionally add price ranges."
            : undefined
        }
        action={
          isPreparingEstimate ? undefined : (
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <ScopePricingModeControl />
              <ApplySavedRatesControl />
            </div>
          )
        }
      >
        {isPreparingEstimate ? (
          <GridLoadingCard
            title="Gathering project scope details"
            helperText="ScopeMate is preparing this scope and draft pricing for your review."
          />
        ) : (
          <ReviewScopeList
            items={items}
            suggestions={suggestions}
            editable={editable}
            token={token}
            onSuggestionsChange={onSuggestionsChange}
            onRefresh={onRefresh}
            onError={onError}
          />
        )}
      </PageSection>

      {!isPreparingEstimate ? (
        <>
          <ContractorEstimateBar />

          <PageSection title="General notes">
            <SectionSurface>
              <Textarea
                value={notes}
                onChange={(event) => onNotesChange(event.target.value)}
                disabled={!editable}
                placeholder="Optional overall feedback for the homeowner"
                rows={4}
              />
            </SectionSurface>
          </PageSection>

          {editable ? (
            <ReviewSubmitActions
              token={token}
              notes={notes}
              onSubmitted={onReviewSubmitted}
            />
          ) : (
            <p className="text-sm font-medium text-neutral-900">Review submitted</p>
          )}
        </>
      ) : null}
    </div>
  );
}
