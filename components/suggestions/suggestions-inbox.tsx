"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import type { ContractorInvitationWithReview, ScopeSuggestionWithMeta } from "@/types";

const ACTIVE_REVIEW_STATUSES = new Set(["pending", "in_review"]);

export function SuggestionsInbox({
  projectId,
  shareEnabled = false,
}: {
  projectId: string;
  shareEnabled?: boolean;
}) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<ScopeSuggestionWithMeta[]>([]);
  const [reviewInProgress, setReviewInProgress] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = useCallback(async () => {
    try {
      const [suggestionsResponse, invitationsResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}/suggestions`),
        shareEnabled
          ? fetch(`/api/projects/${projectId}/invitations`)
          : Promise.resolve(null),
      ]);

      const suggestionsData = await suggestionsResponse.json();
      if (suggestionsResponse.ok) {
        setSuggestions(suggestionsData.suggestions ?? []);
      }

      if (invitationsResponse) {
        const invitationsData = await invitationsResponse.json();
        if (invitationsResponse.ok) {
          const invitations = (invitationsData.invitations ??
            []) as ContractorInvitationWithReview[];
          setReviewInProgress(
            invitations.some((invitation) =>
              ACTIVE_REVIEW_STATUSES.has(invitation.status)
            )
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, shareEnabled]);

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
    if (!shareEnabled) {
      return null;
    }

    return (
      <PageSection
        title="Contractor suggestions"
        description="Feedback from contractors appears here after they submit their review."
      >
        <SectionSurface>
          <p className="text-sm text-[var(--muted)]">
            {reviewInProgress
              ? "A contractor is reviewing your scope. Suggestions will appear here once they submit their review."
              : "Create a share link below to invite a contractor to review your scope."}
          </p>
        </SectionSurface>
      </PageSection>
    );
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
