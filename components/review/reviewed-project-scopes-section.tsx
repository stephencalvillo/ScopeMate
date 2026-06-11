"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChevronRight, Loader2 } from "lucide-react";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { ProposalComparisonSection } from "@/components/review/proposal-comparison-section";
import {
  formatReviewDate,
  formatReviewedScopeHeadline,
  isReviewSubmitted,
} from "@/lib/contractor/review-display";
import type { ReviewedScopeSummary } from "@/lib/contractor/reviewed-scopes";
import { SHARE_LINK_PLACEHOLDER_EMAIL } from "@/lib/contractor/project-share";
import { formatProposalRange } from "@/lib/estimates/money";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { CONTRACTOR_INVITATION_STATUS_LABELS } from "@/types";

function ReviewedScopeCard({
  projectId,
  scope,
}: {
  projectId: string;
  scope: ReviewedScopeSummary;
}) {
  const { invitation } = scope;
  const submitted = isReviewSubmitted(invitation);
  const submittedLabel = formatReviewDate(invitation.review?.submitted_at);
  const proposalLabel = formatProposalRange(
    scope.proposal_min_total ?? 0,
    scope.proposal_max_total ?? 0
  );
  const notesPreview = scope.general_notes
    ? scope.general_notes.length > 120
      ? `${scope.general_notes.slice(0, 120).trim()}…`
      : scope.general_notes
    : null;
  const metaParts = [
    submitted ? submittedLabel : CONTRACTOR_INVITATION_STATUS_LABELS[invitation.status],
    proposalLabel ? `Proposal ${proposalLabel}` : null,
    scope.total_suggestion_count > 0
      ? `${scope.total_suggestion_count} suggestion${
          scope.total_suggestion_count === 1 ? "" : "s"
        }`
      : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/projects/${projectId}/reviews/${invitation.id}`}
      className="block"
    >
      <SectionSurface className="transition-colors hover:bg-neutral-50/80">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-neutral-900">
                {formatReviewedScopeHeadline(invitation, submitted)}
              </p>
              {scope.pending_suggestion_count > 0 ? (
                <Badge variant="pending">
                  {scope.pending_suggestion_count} pending
                </Badge>
              ) : null}
              {scope.is_selected_proposal ? (
                <Badge variant="success">Accepted</Badge>
              ) : null}
              {scope.estimate_status === "declined" ? (
                <Badge variant="secondary">Not selected</Badge>
              ) : null}
            </div>
            {!isShareLinkOnlyPlaceholder(invitation) ? (
              <p className="truncate text-sm text-[var(--muted)]">
                {invitation.contractor_email}
              </p>
            ) : null}
            {invitation.contractor_company ? (
              <p className="text-sm text-[var(--muted)]">
                {invitation.contractor_company}
              </p>
            ) : null}
            {notesPreview ? (
              <p className="line-clamp-2 text-sm text-neutral-800">{notesPreview}</p>
            ) : null}
            <p className="text-xs text-[var(--muted)]">{metaParts.join(" · ")}</p>
          </div>
          <ChevronRight
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted)]"
            aria-hidden
          />
        </div>
      </SectionSurface>
    </Link>
  );
}

function isShareLinkOnlyPlaceholder(
  invitation: ReviewedScopeSummary["invitation"]
) {
  return (
    invitation.contractor_email === SHARE_LINK_PLACEHOLDER_EMAIL &&
    !invitation.accepted_at
  );
}

export function ReviewedProjectScopesSection({
  projectId,
  embedded = false,
  onCountChange,
}: {
  projectId: string;
  embedded?: boolean;
  onCountChange?: (count: number) => void;
}) {
  const [scopes, setScopes] = useState<ReviewedScopeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const loadScopes = useCallback(async () => {
    try {
      const response = isSignedIn
        ? await authenticatedFetch(
            getToken,
            `/api/projects/${projectId}/reviewed-scopes`
          )
        : await fetch(`/api/projects/${projectId}/reviewed-scopes`);
      const data = await response.json();
      if (response.ok) {
        setScopes(data.reviewed_scopes ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn, projectId]);

  useEffect(() => {
    if (!isLoaded) return;
    void loadScopes();
  }, [isLoaded, loadScopes]);

  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  useEffect(() => {
    if (!loading) {
      onCountChangeRef.current?.(scopes.length);
    }
  }, [loading, scopes.length]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading contractor reviews
      </div>
    );
  }

  if (scopes.length === 0) {
    if (!embedded) {
      return null;
    }

    return (
      <SectionSurface>
        <p className="text-sm text-neutral-800">
          No contractor reviews yet. Share your scope from Project overview to
          invite contractors.
        </p>
      </SectionSurface>
    );
  }

  const list = (
    <div className="space-y-3">
      {scopes.map((scope) => (
        <ReviewedScopeCard
          key={scope.invitation.id}
          projectId={projectId}
          scope={scope}
        />
      ))}
    </div>
  );

  const comparison = (
    <ProposalComparisonSection
      projectId={projectId}
      scopes={scopes}
      embedded={embedded}
    />
  );

  if (embedded) {
    return (
      <div className="space-y-8">
        <p className="text-sm text-[var(--muted)]">
          Each contractor who opens your review link gets their own reviewed
          scope and feedback thread.
        </p>
        {comparison}
        {list}
      </div>
    );
  }

  return (
    <>
      {comparison}
      <PageSection
        title="Reviewed project scopes"
        description="Each contractor who opens your review link gets their own reviewed scope and feedback thread."
      >
        {list}
      </PageSection>
    </>
  );
}
