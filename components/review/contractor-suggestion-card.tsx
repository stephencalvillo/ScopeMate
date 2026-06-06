"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScopeSuggestion } from "@/types";

const AI_ASSISTED_SUGGESTION_LABEL = "AI assisted suggestion";

function draftSuggestionLabel(suggestion: ScopeSuggestion) {
  return suggestion.suggestion_type === "add"
    ? "You are suggesting"
    : "You are commenting";
}

function draftSuggestionCopy(suggestion: ScopeSuggestion) {
  if (suggestion.suggestion_type === "add") {
    return suggestion.suggested_text?.trim() || suggestion.contractor_note?.trim() || null;
  }

  return suggestion.contractor_note?.trim() || suggestion.suggested_text?.trim() || null;
}

function draftSuggestionNote(suggestion: ScopeSuggestion) {
  if (suggestion.suggestion_type !== "add") return null;

  const note = suggestion.contractor_note?.trim();
  const text = suggestion.suggested_text?.trim();
  if (!note || note === text) return null;
  return note;
}

export function ContractorSuggestionShell({
  children,
  className,
  indented = false,
}: {
  children: ReactNode;
  className?: string;
  indented?: boolean;
}) {
  return (
    <div
      className={cn(
        indented && "ml-6",
        "rounded-[8px] border border-dashed border-neutral-300 bg-white px-3 py-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ContractorDraftSuggestionCard({
  suggestion,
  editable,
  onRemove,
}: {
  suggestion: ScopeSuggestion;
  editable: boolean;
  onRemove?: () => void;
}) {
  const copy = draftSuggestionCopy(suggestion);
  const note = draftSuggestionNote(suggestion);

  return (
    <ContractorSuggestionShell indented>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs text-[var(--muted)]">
            {draftSuggestionLabel(suggestion)}
          </p>
          {copy ? (
            <p className="text-sm leading-5 text-neutral-800">{copy}</p>
          ) : null}
          {note ? (
            <p className="text-sm leading-5 text-[var(--muted)]">{note}</p>
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
    </ContractorSuggestionShell>
  );
}

export function ContractorSuggestionGenerating() {
  return (
    <ContractorSuggestionShell>
      <div className="space-y-2">
        <p className="text-xs text-[var(--muted)]">
          {AI_ASSISTED_SUGGESTION_LABEL}
        </p>
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Generating scope item...
        </div>
      </div>
    </ContractorSuggestionShell>
  );
}

export function ContractorSuggestionPreviewConfirm({
  suggestion,
  manualDescription,
  loading,
  onConfirm,
  onUseManual,
  onCancel,
}: {
  suggestion: ScopeSuggestion;
  manualDescription: string;
  loading: boolean;
  onConfirm: () => void;
  onUseManual: () => void;
  onCancel: () => void;
}) {
  const copy = draftSuggestionCopy(suggestion);
  const note = draftSuggestionNote(suggestion);

  return (
    <ContractorSuggestionShell>
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-[var(--muted)]">
          {AI_ASSISTED_SUGGESTION_LABEL}
        </p>
          {copy ? (
            <p className="text-sm leading-5 text-neutral-800">{copy}</p>
          ) : null}
          {note ? (
            <p className="text-sm leading-5 text-[var(--muted)]">{note}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={loading} onClick={onConfirm}>
            {loading ? "Saving..." : "Confirm suggestion"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={onUseManual}
          >
            Use my input instead
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>

        {manualDescription.trim() && manualDescription.trim() !== copy ? (
          <p className="text-xs text-[var(--muted)]">
            Your input: {manualDescription.trim()}
          </p>
        ) : null}
      </div>
    </ContractorSuggestionShell>
  );
}
