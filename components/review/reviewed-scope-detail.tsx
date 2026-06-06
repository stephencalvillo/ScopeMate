"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReviewedScopeSnapshotView } from "@/components/review/reviewed-scope-snapshot-view";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { displayContractorName } from "@/lib/contractor/display-contractor";
import { parseReviewScopeSnapshot } from "@/lib/contractor/review-scope-snapshot";
import type { ReviewedScopeSummary } from "@/lib/contractor/reviewed-scopes";
import {
  CONTRACTOR_INVITATION_STATUS_LABELS,
  type ScopeItem,
  type ScopeSuggestionWithMeta,
} from "@/types";

export function ReviewedScopeDetail({
  projectId,
  projectTitle,
  scope,
  suggestions,
  currentSummary,
  currentScopeItems,
}: {
  projectId: string;
  projectTitle: string;
  scope: ReviewedScopeSummary;
  suggestions: ScopeSuggestionWithMeta[];
  currentSummary: string | null;
  currentScopeItems: ScopeItem[];
}) {
  const router = useRouter();
  const { invitation } = scope;
  const submitted = invitation.review?.status === "submitted";
  const statusLabel = submitted
    ? "Review submitted"
    : CONTRACTOR_INVITATION_STATUS_LABELS[invitation.status];
  const submittedLabel = invitation.review?.submitted_at
    ? new Date(invitation.review.submitted_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const scopeSnapshot = parseReviewScopeSnapshot(
    invitation.review?.scope_snapshot ?? null
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to {projectTitle}
          </Link>
        </Button>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-4xl tracking-tight text-neutral-900">
              {displayContractorName(invitation)}
            </h1>
            <Badge variant={submitted ? "info" : "secondary"}>{statusLabel}</Badge>
            {scope.pending_suggestion_count > 0 ? (
              <Badge variant="pending">
                {scope.pending_suggestion_count} pending
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-[var(--muted)]">
            {invitation.contractor_email}
            {invitation.contractor_company
              ? ` · ${invitation.contractor_company}`
              : ""}
          </p>
          {submittedLabel ? (
            <p className="text-sm text-[var(--muted)]">
              Submitted {submittedLabel}
            </p>
          ) : null}
        </div>
      </div>

      <ReviewedScopeSnapshotView
        projectId={projectId}
        snapshot={scopeSnapshot}
        currentSummary={currentSummary}
        currentItems={currentScopeItems}
        submittedLabel={submittedLabel}
        suggestions={suggestions}
        onUpdated={() => router.refresh()}
      />

      {invitation.review?.notes ? (
        <PageSection title="General notes">
          <SectionSurface>
            <p className="whitespace-pre-wrap text-sm text-neutral-800">
              {invitation.review.notes}
            </p>
          </SectionSurface>
        </PageSection>
      ) : null}
    </div>
  );
}
