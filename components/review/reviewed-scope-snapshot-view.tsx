"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, MessageSquare, X } from "lucide-react";
import { EstimateRangeHeader } from "@/components/estimate/estimate-range-inputs";
import { SubmittedScopeEstimateRange } from "@/components/estimate/submitted-scope-estimate-range";
import { ScopeCategoryGroup } from "@/components/scope/scope-category-group";
import { ScopeItemContent } from "@/components/scope/scope-item-content";
import { ScopeItemShell } from "@/components/scope/scope-item-shell";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  groupScopeItemsByCategory,
  compareScopeCategories,
} from "@/lib/scope/group-by-category";
import { snapshotItemToScopeItem } from "@/lib/contractor/review-scope-snapshot";
import { buildSubmittedEstimateDisplay } from "@/lib/estimates/submitted-estimate-display";
import type { SubmittedEstimateDisplay } from "@/lib/estimates/submitted-estimate-display";
import { cn } from "@/lib/utils";
import type {
  ContractorEstimate,
  ReviewScopeSnapshot,
  ReviewScopeSnapshotSuggestion,
  ScopeItem,
  ScopeSuggestionWithMeta,
} from "@/types";

type ScopeView = "submitted" | "current";

function SuggestionTypeLabel({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
      <MessageSquare
        className="h-3.5 w-3.5 shrink-0 text-neutral-500"
        aria-hidden
      />
      <span>{label}</span>
    </p>
  );
}

function IconActionButton({
  label,
  onClick,
  disabled,
  loading,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  const isDisabled = disabled || loading;

  return (
    <span className="group/icon relative inline-flex">
      <button
        type="button"
        aria-label={label}
        disabled={isDisabled}
        onClick={onClick}
        className={cn(
          "rounded-full p-1.5 text-neutral-600 transition-colors",
          "hover:bg-white hover:text-neutral-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          children
        )}
      </button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap",
          "rounded-[6px] bg-neutral-900 px-2 py-1 text-xs font-medium text-white shadow-sm",
          "opacity-0 transition-opacity duration-150",
          "group-hover/icon:opacity-100 group-focus-within/icon:opacity-100"
        )}
      >
        {label}
      </span>
    </span>
  );
}

function editSuggestionForItem(
  suggestions: ReviewScopeSnapshotSuggestion[],
  itemId: string
) {
  return suggestions.find(
    (entry) =>
      entry.target_scope_item_id === itemId &&
      ["edit", "note", "remove"].includes(entry.suggestion_type)
  );
}

function addSuggestionsForCategory(
  suggestions: ReviewScopeSnapshotSuggestion[],
  category: string
) {
  return suggestions.filter(
    (entry) =>
      entry.suggestion_type === "add" && (entry.category ?? "other") === category
  );
}

function ScopeViewSegmentedControl({
  value,
  onChange,
  contractorName,
}: {
  value: ScopeView;
  onChange: (value: ScopeView) => void;
  contractorName: string;
}) {
  const fromContractorLabel = `From ${contractorName.trim().split(/\s+/)[0] || contractorName}`;

  return (
    <div
      className="inline-flex rounded-[4px] border border-[var(--border)] bg-white p-0.5"
      role="tablist"
      aria-label="Scope view"
    >
      {(
        [
          { id: "submitted" as const, label: fromContractorLabel },
          { id: "current" as const, label: "Original" },
        ] as const
      ).map((option) => (
        <Button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          size="sm"
          variant={value === option.id ? "secondary" : "ghost"}
          className="h-8 px-2.5 text-xs"
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function InlineSuggestionActions({
  projectId,
  suggestion,
  variant,
  onRespond,
  onUpdated,
}: {
  projectId: string;
  suggestion: ScopeSuggestionWithMeta;
  variant: "comment" | "add";
  onRespond: () => void;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
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

  async function dismiss() {
    setLoading("dismiss");
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
      setError(data.error ?? "Could not dismiss suggestion.");
    }
  }

  if (suggestion.status === "accepted") {
    return (
      <p className="shrink-0 text-xs font-medium text-[var(--muted)]">Accepted</p>
    );
  }

  if (suggestion.status === "rejected") {
    return (
      <p className="shrink-0 text-xs font-medium text-[var(--muted)]">Declined</p>
    );
  }

  if (suggestion.status === "follow_up_requested") {
    return (
      <p className="max-w-[9rem] shrink-0 text-right text-xs text-[var(--muted)]">
        Waiting for contractor
      </p>
    );
  }

  if (suggestion.status !== "pending") {
    return null;
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-0.5">
        <IconActionButton
          label="Respond"
          onClick={onRespond}
          disabled={loading !== null}
        >
          <MessageSquare className="h-4 w-4" aria-hidden />
        </IconActionButton>
        {variant === "add" ? (
          <>
            <IconActionButton
              label="Accept"
              onClick={accept}
              disabled={loading !== null}
              loading={loading === "accept"}
            >
              <Check className="h-4 w-4" aria-hidden />
            </IconActionButton>
            <IconActionButton
              label="Decline"
              onClick={dismiss}
              disabled={loading !== null}
              loading={loading === "dismiss"}
            >
              <X className="h-4 w-4" aria-hidden />
            </IconActionButton>
          </>
        ) : (
          <IconActionButton
            label="Dismiss"
            onClick={dismiss}
            disabled={loading !== null}
            loading={loading === "dismiss"}
          >
            <X className="h-4 w-4" aria-hidden />
          </IconActionButton>
        )}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </>
  );
}

function InlineRespondForm({
  projectId,
  suggestionId,
  onCancel,
  onUpdated,
}: {
  projectId: string;
  suggestionId: string;
  onCancel: () => void;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [respondMessage, setRespondMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submitRespond(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch(
      `/api/projects/${projectId}/suggestions/${suggestionId}/follow-up`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: respondMessage }),
      }
    );
    setLoading(false);
    if (response.ok) {
      onUpdated();
    } else {
      const data = await response.json();
      setError(data.error ?? "Could not send response.");
    }
  }

  return (
    <form onSubmit={submitRespond} className="space-y-2">
      <Textarea
        value={respondMessage}
        onChange={(event) => setRespondMessage(event.target.value)}
        placeholder="Ask a follow-up question"
        rows={2}
      />
      <div className="flex flex-wrap gap-1">
        <Button type="submit" size="sm" disabled={loading || !respondMessage.trim()}>
          Send
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={loading} onClick={onCancel}>
          Cancel
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}

function InlineSnapshotSuggestion({
  projectId,
  snapshotSuggestion,
  liveSuggestion,
  onUpdated,
}: {
  projectId: string;
  snapshotSuggestion: ReviewScopeSnapshotSuggestion;
  liveSuggestion?: ScopeSuggestionWithMeta;
  onUpdated: () => void;
}) {
  const [showRespond, setShowRespond] = useState(false);
  const isAdd = snapshotSuggestion.suggestion_type === "add";
  const variant = isAdd ? "add" : "comment";
  const showActions = Boolean(liveSuggestion);

  return (
    <div className="ml-6 space-y-2">
      <div className="overflow-visible rounded-[8px] border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2">
        <div className="flex items-start justify-between gap-3 overflow-visible">
          <div className="min-w-0 flex-1 space-y-1 text-left">
            <SuggestionTypeLabel
              label={isAdd ? "Contractor suggestion" : "Contractor comment"}
            />
            {isAdd ? (
              <>
                {snapshotSuggestion.suggested_text ? (
                  <p className="text-sm font-medium leading-5 text-neutral-900">
                    {snapshotSuggestion.suggested_text}
                  </p>
                ) : null}
                {snapshotSuggestion.contractor_note ? (
                  <p className="text-sm leading-5 text-neutral-800">
                    {snapshotSuggestion.contractor_note}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                {snapshotSuggestion.contractor_note ? (
                  <p className="text-sm text-neutral-900">
                    {snapshotSuggestion.contractor_note}
                  </p>
                ) : null}
                {snapshotSuggestion.suggested_text ? (
                  <p className="text-sm text-neutral-800">
                    {snapshotSuggestion.suggested_text}
                  </p>
                ) : null}
              </>
            )}

            {liveSuggestion?.follow_ups && liveSuggestion.follow_ups.length > 0 ? (
              <div className="space-y-1 pt-1">
                {liveSuggestion.follow_ups.map((entry) => (
                  <div key={entry.id} className="text-sm">
                    <p className="font-medium text-neutral-800">
                      {entry.author_role === "homeowner"
                        ? "You asked"
                        : "Contractor replied"}
                    </p>
                    <p className="text-[var(--muted)]">{entry.message}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {showActions && !showRespond ? (
            <div className="flex shrink-0 flex-col items-end gap-1 overflow-visible">
              <InlineSuggestionActions
                projectId={projectId}
                suggestion={liveSuggestion!}
                variant={variant}
                onRespond={() => setShowRespond(true)}
                onUpdated={onUpdated}
              />
            </div>
          ) : null}
        </div>
      </div>

      {showActions && showRespond ? (
        <InlineRespondForm
          projectId={projectId}
          suggestionId={liveSuggestion!.id}
          onCancel={() => setShowRespond(false)}
          onUpdated={onUpdated}
        />
      ) : null}
    </div>
  );
}

function CurrentScopeList({
  items,
  estimateDisplay,
}: {
  items: ScopeItem[];
  estimateDisplay?: SubmittedEstimateDisplay | null;
}) {
  const groups = useMemo(() => groupScopeItemsByCategory(items), [items]);
  const usesItemPricing = estimateDisplay?.pricingMode === "item";
  const usesSectionPricing = estimateDisplay?.pricingMode === "section";

  if (groups.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        This project does not have any scope items yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {estimateDisplay && usesItemPricing ? (
        <EstimateRangeHeader className="hidden md:flex" />
      ) : null}
      {groups.map((group) => {
        const sectionRange = estimateDisplay?.sectionRanges.get(group.category);

        return (
          <ScopeCategoryGroup
            key={group.category}
            category={group.category}
            itemCount={group.items.length}
            chevronAfterAside={usesSectionPricing && Boolean(sectionRange)}
            headerAside={
              usesSectionPricing && sectionRange ? (
                <SubmittedScopeEstimateRange
                  laborCost={sectionRange.labor_cost}
                  materialCost={sectionRange.material_cost}
                />
              ) : null
            }
          >
            {group.items.map((item) => {
              const itemRange = estimateDisplay?.scopeItemRanges.get(item.id);

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between gap-3",
                    usesItemPricing &&
                      "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] md:items-center"
                  )}
                >
                  <ScopeItemShell
                    className={
                      usesItemPricing
                        ? "min-w-0 flex-1 md:flex md:min-h-11 md:w-full md:items-center"
                        : "w-full"
                    }
                  >
                    <ScopeItemContent item={item} />
                  </ScopeItemShell>
                  {usesItemPricing && itemRange ? (
                    <SubmittedScopeEstimateRange
                      laborCost={itemRange.labor_cost}
                      materialCost={itemRange.material_cost}
                    />
                  ) : null}
                </div>
              );
            })}
          </ScopeCategoryGroup>
        );
      })}
    </div>
  );
}

function SubmittedScopeList({
  snapshot,
  projectId,
  suggestionsById,
  onUpdated,
  estimateDisplay,
}: {
  snapshot: ReviewScopeSnapshot;
  projectId: string;
  suggestionsById: Map<string, ScopeSuggestionWithMeta>;
  onUpdated: () => void;
  estimateDisplay?: SubmittedEstimateDisplay | null;
}) {
  const items = useMemo(
    () =>
      snapshot.scope_items.map((item) =>
        snapshotItemToScopeItem(item, projectId, snapshot.captured_at)
      ),
    [projectId, snapshot]
  );

  const groups = useMemo(() => {
    const baseGroups = groupScopeItemsByCategory(items);
    const categoriesWithAdds = new Set(
      snapshot.suggestions
        .filter((entry) => entry.suggestion_type === "add")
        .map((entry) => entry.category ?? "other")
    );
    const existingCategories = new Set(baseGroups.map((group) => group.category));

    for (const category of categoriesWithAdds) {
      if (!existingCategories.has(category)) {
        baseGroups.push({ category, items: [] });
      }
    }

    return baseGroups.sort((a, b) =>
      compareScopeCategories(a.category, b.category)
    );
  }, [items, snapshot.suggestions]);

  const usesItemPricing = estimateDisplay?.pricingMode === "item";
  const usesSectionPricing = estimateDisplay?.pricingMode === "section";

  if (groups.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        This review did not include any scope items.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {estimateDisplay && usesItemPricing ? (
        <EstimateRangeHeader className="hidden md:flex" />
      ) : null}
      {groups.map((group) => {
        const addSuggestions = addSuggestionsForCategory(
          snapshot.suggestions,
          group.category
        );
        const sectionRange = estimateDisplay?.sectionRanges.get(group.category);

        return (
          <ScopeCategoryGroup
            key={group.category}
            category={group.category}
            itemCount={group.items.length + addSuggestions.length}
            chevronAfterAside={usesSectionPricing && Boolean(sectionRange)}
            headerAside={
              usesSectionPricing && sectionRange ? (
                <SubmittedScopeEstimateRange
                  laborCost={sectionRange.labor_cost}
                  materialCost={sectionRange.material_cost}
                />
              ) : null
            }
          >
            {group.items.map((item) => {
              const editSuggestion = editSuggestionForItem(
                snapshot.suggestions,
                item.id
              );
              const itemRange = estimateDisplay?.scopeItemRanges.get(item.id);

              return (
                <div key={item.id} className="space-y-2">
                  <div
                    className={cn(
                      "flex items-center justify-between gap-3",
                      usesItemPricing &&
                        "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] md:items-center"
                    )}
                  >
                    <ScopeItemShell
                      className={
                        usesItemPricing
                          ? "min-w-0 flex-1 md:flex md:min-h-11 md:w-full md:items-center"
                          : "w-full"
                      }
                    >
                      <ScopeItemContent item={item} showAttribution={false} />
                    </ScopeItemShell>
                    {usesItemPricing && itemRange ? (
                      <SubmittedScopeEstimateRange
                        laborCost={itemRange.labor_cost}
                        materialCost={itemRange.material_cost}
                      />
                    ) : null}
                  </div>
                  {editSuggestion ? (
                    <InlineSnapshotSuggestion
                      projectId={projectId}
                      snapshotSuggestion={editSuggestion}
                      liveSuggestion={suggestionsById.get(editSuggestion.id)}
                      onUpdated={onUpdated}
                    />
                  ) : null}
                </div>
              );
            })}

            {addSuggestions.map((suggestion) => (
              <InlineSnapshotSuggestion
                key={suggestion.id}
                projectId={projectId}
                snapshotSuggestion={suggestion}
                liveSuggestion={suggestionsById.get(suggestion.id)}
                onUpdated={onUpdated}
              />
            ))}
          </ScopeCategoryGroup>
        );
      })}
    </div>
  );
}

export function ReviewedScopeSnapshotView({
  projectId,
  snapshot,
  currentSummary,
  currentItems,
  submittedLabel,
  contractorName,
  suggestions,
  estimate,
  onUpdated,
}: {
  projectId: string;
  snapshot: ReviewScopeSnapshot | null;
  currentSummary: string | null;
  currentItems: ScopeItem[];
  submittedLabel: string | null;
  contractorName: string;
  suggestions: ScopeSuggestionWithMeta[];
  estimate?: ContractorEstimate | null;
  onUpdated: () => void;
}) {
  const [view, setView] = useState<ScopeView>("submitted");

  const suggestionsById = useMemo(
    () => new Map(suggestions.map((suggestion) => [suggestion.id, suggestion])),
    [suggestions]
  );

  const snapshotItems = useMemo(
    () =>
      snapshot
        ? snapshot.scope_items.map((item) =>
            snapshotItemToScopeItem(item, projectId, snapshot.captured_at)
          )
        : [],
    [projectId, snapshot]
  );

  const submittedEstimateDisplay = useMemo(
    () =>
      estimate?.line_items
        ? buildSubmittedEstimateDisplay({
            scopeItems: snapshotItems,
            lineItems: estimate.line_items,
          })
        : null,
    [estimate?.line_items, snapshotItems]
  );

  const currentEstimateDisplay = useMemo(
    () =>
      estimate?.line_items
        ? buildSubmittedEstimateDisplay({
            scopeItems: currentItems,
            lineItems: estimate.line_items,
          })
        : null,
    [currentItems, estimate?.line_items]
  );

  const capturedLabel = snapshot
    ? new Date(snapshot.captured_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : submittedLabel;

  const description =
    view === "submitted"
      ? capturedLabel
        ? `Scope and suggestions as they were when this contractor submitted on ${capturedLabel}.`
        : "Scope and suggestions from this contractor's review."
      : "Your current project scope for comparison.";

  return (
    <PageSection title="Project scope">
      <div className="space-y-6">
        {snapshot ? (
          <div className="space-y-3">
            <ScopeViewSegmentedControl
              value={view}
              onChange={setView}
              contractorName={contractorName}
            />
            <p className="text-sm text-[var(--muted)]">{description}</p>
          </div>
        ) : null}

        {!snapshot ? (
          <SectionSurface>
            <p className="text-sm text-neutral-800">
              No scope snapshot was saved for this review. Use the suggestions
              below to see what this contractor proposed.
            </p>
          </SectionSurface>
        ) : view === "submitted" ? (
          <div className="space-y-6">
            {snapshot.ai_summary ? (
              <ScopeSummary summary={snapshot.ai_summary} />
            ) : null}
            <SubmittedScopeList
              snapshot={snapshot}
              projectId={projectId}
              suggestionsById={suggestionsById}
              onUpdated={onUpdated}
              estimateDisplay={submittedEstimateDisplay}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {currentSummary ? <ScopeSummary summary={currentSummary} /> : null}
            <CurrentScopeList
              items={currentItems}
              estimateDisplay={currentEstimateDisplay}
            />
          </div>
        )}
      </div>
    </PageSection>
  );
}
