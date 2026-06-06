"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DraftAddSuggestionEstimateInputs } from "@/components/estimate/category-pricing-controls";
import { useOptionalContractorEstimate } from "@/components/estimate/contractor-estimate-context";
import { ContractorSuggestionShell } from "@/components/review/contractor-suggestion-card";
import { IconActionButton } from "@/components/review/icon-action-button";
import { ScopeItemContent } from "@/components/scope/scope-item-content";
import { ScopeItemShell } from "@/components/scope/scope-item-shell";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ScopeItem, ScopeSuggestion } from "@/types";

function suggestionAsScopeItem(suggestion: ScopeSuggestion): ScopeItem {
  return {
    id: suggestion.id,
    project_id: suggestion.project_id,
    category: suggestion.category ?? "other",
    text: suggestion.suggested_text?.trim() ?? "",
    source: "contractor",
    priority: "recommended",
    status: "active",
    sort_order: 0,
    needs_verification: false,
    created_at: suggestion.created_at,
    updated_at: suggestion.updated_at,
  };
}

export function ContractorDraftAddSuggestionRow({
  suggestion,
  editable,
  token,
  onUpdate,
  onRemove,
  onError,
}: {
  suggestion: ScopeSuggestion;
  editable: boolean;
  token: string;
  onUpdate: (suggestion: ScopeSuggestion) => void;
  onRemove: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const estimate = useOptionalContractorEstimate();
  const showEstimate = estimate?.showEstimate ?? false;
  const usesItemPricing = estimate?.pricingMode === "item";
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(suggestion.suggested_text ?? "");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function saveEdit() {
    const trimmed = editText.trim();
    if (!trimmed) return;

    setSaving(true);
    const response = await fetch(
      `/api/review/${token}/suggestions/${suggestion.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggested_text: trimmed }),
      }
    );
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      onError(data.error ?? "Could not update suggestion.");
      return;
    }

    onUpdate(data.suggestion);
    setEditing(false);
  }

  function cancelEdit() {
    setEditText(suggestion.suggested_text ?? "");
    setEditing(false);
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await onRemove();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <ContractorSuggestionShell>
      <div className="space-y-2">
        <p className="text-xs text-[var(--muted)]">You are suggesting</p>
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
            {editing ? (
              <Input
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void saveEdit();
                  }
                  if (event.key === "Escape") {
                    cancelEdit();
                  }
                }}
                disabled={saving}
                className="h-9 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <ScopeItemContent
                item={suggestionAsScopeItem(suggestion)}
                showAttribution={false}
                compact
                actions={
                  editable ? (
                    <>
                      <IconActionButton
                        label="Edit"
                        onClick={() => {
                          setEditText(suggestion.suggested_text ?? "");
                          setEditing(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </IconActionButton>
                      <IconActionButton
                        label="Remove"
                        onClick={() => void handleRemove()}
                        loading={removing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconActionButton>
                    </>
                  ) : null
                }
              />
            )}
          </ScopeItemShell>
          {showEstimate && usesItemPricing ? (
            <DraftAddSuggestionEstimateInputs suggestionId={suggestion.id} />
          ) : null}
        </div>
      </div>
    </ContractorSuggestionShell>
  );
}
