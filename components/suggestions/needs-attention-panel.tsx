"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { SectionSurface } from "@/components/layout/page-section";
import type { ScopeSuggestionWithMeta } from "@/types";

export function NeedsAttentionPanel({
  projectId,
  onCountChange,
  onSuggestionsUpdated,
  previewApiBase,
}: {
  projectId: string;
  onCountChange?: (count: number) => void;
  onSuggestionsUpdated?: () => void;
  previewApiBase?: string;
}) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<ScopeSuggestionWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = useCallback(async () => {
    try {
      const suggestionsPath = previewApiBase
        ? `${previewApiBase}/suggestions`
        : `/api/projects/${projectId}/suggestions`;
      const response = await fetch(suggestionsPath);
      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.suggestions ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [previewApiBase, projectId]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const needsAttention = suggestions.filter((item) => item.status === "pending");
  const awaitingContractor = suggestions.filter(
    (item) => item.status === "follow_up_requested"
  );

  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  useEffect(() => {
    onCountChangeRef.current?.(needsAttention.length);
  }, [needsAttention.length]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading items that need your response
      </div>
    );
  }

  if (needsAttention.length === 0 && awaitingContractor.length === 0) {
    return (
      <SectionSurface>
        <p className="text-sm text-neutral-800">
          Nothing needs your response right now. Contractor suggestions will
          appear here when a review is submitted.
        </p>
      </SectionSurface>
    );
  }

  return (
    <div className="space-y-8">
      {needsAttention.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            {needsAttention.length} suggestion
            {needsAttention.length === 1 ? "" : "s"} waiting for your response
          </p>
          {needsAttention.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              projectId={projectId}
              suggestion={suggestion}
              variant="needs-attention"
              reviewUrl={`/projects/${projectId}/reviews/${suggestion.invitation_id}`}
              onUpdated={() => {
                loadSuggestions();
                onSuggestionsUpdated?.();
                router.refresh();
              }}
            />
          ))}
        </div>
      ) : (
        <SectionSurface>
          <p className="text-sm text-neutral-800">
            All suggestions have been addressed. Check back when new reviews come
            in.
          </p>
        </SectionSurface>
      )}

      {awaitingContractor.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-900">
            Awaiting contractor reply
          </p>
          <div className="space-y-3">
            {awaitingContractor.map((suggestion) => (
              <SectionSurface key={suggestion.id} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-900">
                    {suggestion.contractor_name ?? "Contractor"}
                  </p>
                  <Link
                    href={`/projects/${projectId}/reviews/${suggestion.invitation_id}`}
                    className="text-sm text-[var(--muted)] hover:text-neutral-900"
                  >
                    View review
                  </Link>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Waiting for a reply to your follow-up question.
                </p>
              </SectionSurface>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
