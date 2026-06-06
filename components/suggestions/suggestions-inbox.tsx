"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import type { ScopeSuggestionWithMeta } from "@/types";

export function SuggestionsInbox({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<ScopeSuggestionWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/suggestions`);
      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.suggestions ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const pending = suggestions.filter((item) =>
    ["pending", "follow_up_requested"].includes(item.status)
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking for contractor suggestions
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <PageSection
      title="Contractor suggestions"
      description="Review feedback from contractors who completed their review."
    >
      {pending.length === 0 ? (
        <SectionSurface>
          <p className="text-sm text-[var(--muted)]">
            All contractor suggestions have been resolved.
          </p>
        </SectionSurface>
      ) : (
        <div className="space-y-3">
          {pending.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              projectId={projectId}
              suggestion={suggestion}
              onUpdated={() => {
                loadSuggestions();
                router.refresh();
              }}
            />
          ))}
        </div>
      )}
    </PageSection>
  );
}
