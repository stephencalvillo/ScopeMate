"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import {
  CategorySectionEstimateInputs,
  ScopeItemEstimateInputs,
} from "@/components/estimate/category-pricing-controls";
import { useOptionalContractorEstimate } from "@/components/estimate/contractor-estimate-context";
import { ContractorDraftAddSuggestionRow } from "@/components/review/contractor-draft-add-suggestion-row";
import {
  ContractorDraftSuggestionCard,
  ContractorSuggestionGenerating,
  ContractorSuggestionPreviewConfirm,
} from "@/components/review/contractor-suggestion-card";
import { ScopeCategoryGroup } from "@/components/scope/scope-category-group";
import { ScopeItemContent } from "@/components/scope/scope-item-content";
import { ScopeItemShell } from "@/components/scope/scope-item-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { groupScopeItemsByCategory, compareScopeCategories } from "@/lib/scope/group-by-category";
import { cn, hoverRevealOnDesktopClassName } from "@/lib/utils";
import type { ScopeItem, ScopeSuggestion, SuggestionFollowUp } from "@/types";

type ReviewSuggestion = ScopeSuggestion & { follow_ups?: SuggestionFollowUp[] };

function draftForItem(suggestions: ReviewSuggestion[], itemId: string) {
  return suggestions.find(
    (entry) =>
      entry.target_scope_item_id === itemId &&
      entry.status === "draft" &&
      entry.suggestion_type === "edit"
  );
}

function draftAddsForCategory(suggestions: ReviewSuggestion[], category: string) {
  return suggestions.filter(
    (entry) =>
      entry.suggestion_type === "add" &&
      entry.status === "draft" &&
      (entry.category ?? "other") === category
  );
}

function followUpAddsForCategory(suggestions: ReviewSuggestion[], category: string) {
  return suggestions.filter(
    (entry) =>
      entry.suggestion_type === "add" &&
      entry.status === "follow_up_requested" &&
      (entry.category ?? "other") === category
  );
}

function followUpForItem(suggestions: ReviewSuggestion[], itemId: string) {
  return suggestions.find(
    (entry) =>
      entry.target_scope_item_id === itemId &&
      entry.status === "follow_up_requested"
  );
}

function followUpForSuggestion(
  suggestions: ReviewSuggestion[],
  suggestionId: string
) {
  const suggestion = suggestions.find((entry) => entry.id === suggestionId);
  return suggestion?.status === "follow_up_requested" ? suggestion : undefined;
}

export function ReviewScopeList({
  items,
  suggestions,
  editable,
  token,
  onSuggestionsChange,
  onRefresh,
  onError,
}: {
  items: ScopeItem[];
  suggestions: ReviewSuggestion[];
  editable: boolean;
  token: string;
  onSuggestionsChange: (suggestions: ReviewSuggestion[]) => void;
  onRefresh: () => void;
  onError: (message: string) => void;
}) {
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [activeAddCategory, setActiveAddCategory] = useState<string | null>(null);
  const estimate = useOptionalContractorEstimate();
  const showEstimate = estimate?.showEstimate ?? false;

  const groups = useMemo(() => {
    const baseGroups = groupScopeItemsByCategory(items);
    const categoriesWithDraftAdds = new Set(
      suggestions
        .filter(
          (entry) => entry.suggestion_type === "add" && entry.status === "draft"
        )
        .map((entry) => entry.category ?? "other")
    );

    const existingCategories = new Set(baseGroups.map((group) => group.category));

    for (const category of categoriesWithDraftAdds) {
      if (!existingCategories.has(category)) {
        baseGroups.push({ category, items: [] });
      }
    }

    return baseGroups.sort((a, b) =>
      compareScopeCategories(a.category, b.category)
    );
  }, [items, suggestions]);

  async function saveItemComment(
    item: ScopeItem,
    payload: { comment: string }
  ) {
    const existing = draftForItem(suggestions, item.id);

    if (existing) {
      const response = await fetch(
        `/api/review/${token}/suggestions/${existing.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractor_note: payload.comment,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        onError(data.error ?? "Could not save comment.");
        return;
      }
      onSuggestionsChange(
        suggestions.map((entry) =>
          entry.id === existing.id ? data.suggestion : entry
        )
      );
    } else {
      const response = await fetch(`/api/review/${token}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestion_type: "edit",
          target_scope_item_id: item.id,
          contractor_note: payload.comment,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        onError(data.error ?? "Could not save comment.");
        return;
      }
      onSuggestionsChange([...suggestions, data.suggestion]);
    }

    setActiveCommentId(null);
  }

  async function removeSuggestion(suggestionId: string) {
    const response = await fetch(
      `/api/review/${token}/suggestions/${suggestionId}`,
      { method: "DELETE" }
    );
    if (response.ok) {
      onSuggestionsChange(suggestions.filter((entry) => entry.id !== suggestionId));
    }
  }

  async function requestAddSuggestion(category: string, description: string) {
    const response = await fetch(`/api/review/${token}/suggestions/generate-add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, description }),
    });
    const data = await response.json();
    if (!response.ok) {
      onError(data.error ?? "Could not add item.");
      return null;
    }
    return data.suggestion as ReviewSuggestion;
  }

  async function finalizeAddSuggestion(suggestion: ReviewSuggestion) {
    onSuggestionsChange([...suggestions, suggestion]);
    setActiveAddCategory(null);
  }

  async function useManualAddSuggestion(
    suggestion: ReviewSuggestion,
    description: string
  ) {
    const response = await fetch(
      `/api/review/${token}/suggestions/${suggestion.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggested_text: description,
          contractor_note: "",
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      onError(data.error ?? "Could not save suggestion.");
      return;
    }
    onSuggestionsChange([...suggestions, data.suggestion]);
    setActiveAddCategory(null);
  }

  async function discardPendingSuggestion(suggestionId: string) {
    await removeSuggestion(suggestionId);
  }

  if (groups.length === 0 && !editable) {
    return (
      <p className="text-sm text-[var(--muted)]">
        This project does not have any scope items yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const draftAdds = draftAddsForCategory(suggestions, group.category);
        const usesItemPricing = estimate?.pricingMode === "item";
        const usesSectionPricing = showEstimate && estimate?.pricingMode === "section";

        return (
          <ScopeCategoryGroup
            key={group.category}
            category={group.category}
            itemCount={group.items.length + draftAdds.length}
            chevronAfterAside={usesSectionPricing}
            headerAside={
              showEstimate ? (
                <CategorySectionEstimateInputs category={group.category} />
              ) : null
            }
          >
            {group.items.map((item) => {
              const draft = draftForItem(suggestions, item.id);
              const followUp = followUpForItem(suggestions, item.id);
              const showCommentForm = activeCommentId === item.id;

              return (
                <div key={item.id} className="space-y-2">
                  <div
                    className={cn(
                      "grid gap-3",
                      showEstimate &&
                        usesItemPricing &&
                        "md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] md:items-start"
                    )}
                  >
                    <ScopeItemShell
                      interactive={editable}
                      className={
                        showEstimate && usesItemPricing
                          ? "flex min-h-11 w-full items-center"
                          : "w-full"
                      }
                    >
                      <ScopeItemContent
                        item={item}
                        showAttribution={false}
                        actions={
                          editable ? (
                            <button
                              type="button"
                              aria-label="Comment on this item"
                              onClick={() =>
                                setActiveCommentId((current) =>
                                  current === item.id ? null : item.id
                                )
                              }
                              className={cn(
                                "rounded-full p-1.5 text-neutral-600 transition-opacity",
                                hoverRevealOnDesktopClassName,
                                (showCommentForm || draft) && "opacity-100",
                                "hover:bg-white/80 hover:text-neutral-900"
                              )}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          ) : null
                        }
                      />
                    </ScopeItemShell>
                    {showEstimate && usesItemPricing ? (
                      <ScopeItemEstimateInputs scopeItemId={item.id} />
                    ) : null}
                  </div>

                  {draft && !showCommentForm ? (
                    <ContractorDraftSuggestionCard
                      suggestion={draft}
                      editable={editable}
                      onRemove={() => removeSuggestion(draft.id)}
                    />
                  ) : null}

                  {showCommentForm ? (
                    <ItemCommentForm
                      initialComment={draft?.contractor_note ?? ""}
                      onCancel={() => setActiveCommentId(null)}
                      onSave={(payload) => saveItemComment(item, payload)}
                    />
                  ) : null}

                  {followUp ? (
                    <FollowUpReplyPanel
                      suggestion={followUp}
                      onSubmit={async (message) => {
                        const response = await fetch(
                          `/api/review/${token}/suggestions/${followUp.id}/follow-up`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ message }),
                          }
                        );
                        if (response.ok) {
                          onRefresh();
                        } else {
                          const data = await response.json();
                          onError(data.error ?? "Could not send response.");
                        }
                      }}
                    />
                  ) : null}
                </div>
              );
            })}

            {draftAdds.map((suggestion) => (
              <div key={suggestion.id} className="space-y-2">
                <ContractorDraftAddSuggestionRow
                  suggestion={suggestion}
                  editable={editable}
                  token={token}
                  onUpdate={(updated) =>
                    onSuggestionsChange(
                      suggestions.map((entry) =>
                        entry.id === updated.id ? updated : entry
                      )
                    )
                  }
                  onRemove={() => removeSuggestion(suggestion.id)}
                  onError={onError}
                />
                {followUpForSuggestion(suggestions, suggestion.id) ? (
                  <FollowUpReplyPanel
                    suggestion={
                      followUpForSuggestion(suggestions, suggestion.id)!
                    }
                    onSubmit={async (message) => {
                      const followUp = followUpForSuggestion(
                        suggestions,
                        suggestion.id
                      )!;
                      const response = await fetch(
                        `/api/review/${token}/suggestions/${followUp.id}/follow-up`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ message }),
                        }
                      );
                      if (response.ok) {
                        onRefresh();
                      } else {
                        const data = await response.json();
                        onError(data.error ?? "Could not send response.");
                      }
                    }}
                  />
                ) : null}
              </div>
            ))}

            {followUpAddsForCategory(suggestions, group.category).map(
              (suggestion) => (
                <div key={suggestion.id} className="space-y-2">
                  <ContractorDraftSuggestionCard
                    suggestion={suggestion}
                    editable={false}
                  />
                  <FollowUpReplyPanel
                    suggestion={suggestion}
                    onSubmit={async (message) => {
                      const response = await fetch(
                        `/api/review/${token}/suggestions/${suggestion.id}/follow-up`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ message }),
                        }
                      );
                      if (response.ok) {
                        onRefresh();
                      } else {
                        const data = await response.json();
                        onError(data.error ?? "Could not send response.");
                      }
                    }}
                  />
                </div>
              )
            )}

            {editable ? (
              activeAddCategory === group.category ? (
                <CategoryAddForm
                  onCancel={() => setActiveAddCategory(null)}
                  onGenerate={(description) =>
                    requestAddSuggestion(group.category, description)
                  }
                  onConfirm={finalizeAddSuggestion}
                  onUseManual={useManualAddSuggestion}
                  onDiscard={discardPendingSuggestion}
                />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-2 text-[var(--muted)] hover:text-neutral-900"
                  onClick={() => setActiveAddCategory(group.category)}
                >
                  <Plus className="h-4 w-4" />
                  Add item
                </Button>
              )
            ) : null}
          </ScopeCategoryGroup>
        );
      })}
    </div>
  );
}

function CategoryAddForm({
  onCancel,
  onGenerate,
  onConfirm,
  onUseManual,
  onDiscard,
}: {
  onCancel: () => void;
  onGenerate: (description: string) => Promise<ReviewSuggestion | null>;
  onConfirm: (suggestion: ReviewSuggestion) => void;
  onUseManual: (
    suggestion: ReviewSuggestion,
    description: string
  ) => Promise<void>;
  onDiscard: (suggestionId: string) => Promise<void>;
}) {
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<"input" | "generating" | "preview">(
    "input"
  );
  const [pendingSuggestion, setPendingSuggestion] =
    useState<ReviewSuggestion | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function handleGenerate() {
    if (!description.trim()) return;
    setPhase("generating");
    const suggestion = await onGenerate(description.trim());
    if (!suggestion) {
      setPhase("input");
      return;
    }
    setPendingSuggestion(suggestion);
    setPhase("preview");
  }

  async function handleConfirm() {
    if (!pendingSuggestion) return;
    setActionLoading(true);
    onConfirm(pendingSuggestion);
    setActionLoading(false);
  }

  async function handleUseManual() {
    if (!pendingSuggestion) return;
    setActionLoading(true);
    await onUseManual(pendingSuggestion, description.trim());
    setActionLoading(false);
  }

  async function handleCancelPreview() {
    if (!pendingSuggestion) return;
    setActionLoading(true);
    await onDiscard(pendingSuggestion.id);
    setPendingSuggestion(null);
    setActionLoading(false);
    setPhase("input");
  }

  function handleCancelInput() {
    onCancel();
  }

  if (phase === "generating") {
    return <ContractorSuggestionGenerating />;
  }

  if (phase === "preview" && pendingSuggestion) {
    return (
      <ContractorSuggestionPreviewConfirm
        suggestion={pendingSuggestion}
        manualDescription={description}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onUseManual={handleUseManual}
        onCancel={handleCancelPreview}
      />
    );
  }

  return (
    <div className="space-y-3 rounded-[8px] border border-[var(--border)] bg-white p-3">
      <Textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Describe what should be added in this category..."
        rows={3}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={actionLoading || !description.trim()}
          onClick={handleGenerate}
        >
          Add item
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancelInput}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ItemCommentForm({
  initialComment,
  onCancel,
  onSave,
}: {
  initialComment: string;
  onCancel: () => void;
  onSave: (payload: { comment: string }) => void;
}) {
  const [comment, setComment] = useState(initialComment);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!comment.trim()) return;
    setSaving(true);
    await onSave({ comment: comment.trim() });
    setSaving(false);
  }

  return (
    <div className="ml-6 space-y-3 rounded-[8px] border border-[var(--border)] bg-white p-3">
      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Your comment on this item"
        className="min-h-[150px]"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={saving || !comment.trim()} onClick={handleSave}>
          {saving ? "Saving..." : "Save comment"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function FollowUpReplyPanel({
  suggestion,
  onSubmit,
}: {
  suggestion: ReviewSuggestion;
  onSubmit: (message: string) => Promise<void>;
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-3 rounded-[8px] bg-neutral-50 p-3">
      {suggestion.follow_ups?.map((entry) => (
        <div key={entry.id} className="text-sm">
          <p className="font-medium text-neutral-800">
            {entry.author_role === "homeowner" ? "Homeowner asked" : "You replied"}
          </p>
          <p className="text-[var(--muted)]">{entry.message}</p>
        </div>
      ))}
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Reply to the homeowner's follow-up"
        rows={3}
      />
      <Button
        size="sm"
        disabled={!message.trim()}
        onClick={() => {
          onSubmit(message.trim());
          setMessage("");
        }}
      >
        Send reply
      </Button>
    </div>
  );
}
