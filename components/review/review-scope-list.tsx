"use client";

import { useMemo, useState } from "react";
import { Loader2, MessageSquare, Plus } from "lucide-react";
import { ScopeCategoryGroup } from "@/components/scope/scope-category-group";
import { ScopeItemContent } from "@/components/scope/scope-item-content";
import { ScopeItemShell } from "@/components/scope/scope-item-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { groupScopeItemsByCategory, compareScopeCategories } from "@/lib/scope/group-by-category";
import { cn, formatCategoryLabel } from "@/lib/utils";
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

  async function generateAddItem(category: string, description: string) {
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
    onSuggestionsChange([...suggestions, data.suggestion]);
    setActiveAddCategory(null);
    return data.suggestion as ReviewSuggestion;
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

        return (
          <ScopeCategoryGroup
            key={group.category}
            category={group.category}
            itemCount={group.items.length + draftAdds.length}
          >
            {group.items.map((item) => {
              const draft = draftForItem(suggestions, item.id);
              const followUp = followUpForItem(suggestions, item.id);
              const showCommentForm = activeCommentId === item.id;

              return (
                <div key={item.id} className="space-y-2">
                  <ScopeItemShell interactive={editable}>
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
                              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
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

                  {draft && !showCommentForm ? (
                    <DraftSuggestionPreview
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
                <DraftSuggestionPreview
                  suggestion={suggestion}
                  editable={editable}
                  onRemove={() => removeSuggestion(suggestion.id)}
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
                  <DraftSuggestionPreview
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
                  onSubmit={(description) =>
                    generateAddItem(group.category, description)
                  }
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

function DraftSuggestionPreview({
  suggestion,
  editable,
  onRemove,
}: {
  suggestion: ReviewSuggestion;
  editable: boolean;
  onRemove?: () => void;
}) {
  const isComment = suggestion.suggestion_type !== "add";

  return (
    <div className="ml-6 rounded-[8px] border border-dashed border-neutral-300 bg-white px-3 py-2">
      {isComment ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              Your comment
            </p>
            {suggestion.contractor_note ? (
              <p className="flex items-start gap-1.5 text-sm text-neutral-900">
                <MessageSquare
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-500"
                  aria-hidden
                />
                <span>{suggestion.contractor_note}</span>
              </p>
            ) : null}
          </div>
          {editable ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 self-center px-2"
              onClick={() => onRemove?.()}
            >
              Remove
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Suggested add
            </p>
            {suggestion.suggested_text ? (
              <p className="text-sm font-medium text-neutral-900">
                {suggestion.suggested_text}
              </p>
            ) : null}
            {suggestion.contractor_note ? (
              <p className="text-sm text-neutral-900">
                {suggestion.contractor_note}
              </p>
            ) : null}
          </div>
          {editable ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 self-center px-2"
              onClick={() => onRemove?.()}
            >
              Remove
            </Button>
          ) : null}
        </div>
      )}
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

function CategoryAddForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (description: string) => Promise<ReviewSuggestion | null>;
}) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!description.trim()) return;
    setLoading(true);
    await onSubmit(description.trim());
    setDescription("");
    setLoading(false);
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
        <Button size="sm" disabled={loading || !description.trim()} onClick={handleSubmit}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add item"
          )}
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
