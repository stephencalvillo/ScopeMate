"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { SharedPhotoGallery } from "@/components/share/shared-photo-gallery";
import {
  AcceptedProjectEstimateSection,
  AcceptedProjectHeader,
} from "@/components/review/accepted-proposal-project-view";
import {
  ProposalAcceptDockProvider,
  ProposalEstimateHeaderSection,
} from "@/components/estimate/proposal-decision-panel";
import { ReviewedScopeSnapshotView } from "@/components/review/reviewed-scope-snapshot-view";
import { BreadcrumbLink, BreadcrumbNav } from "@/components/layout/breadcrumb-link";
import { PageBreadcrumbHeader } from "@/components/layout/page-breadcrumb-header";
import { cn } from "@/lib/utils";
import {
  formatReviewDate,
  formatReviewedScopeHeadline,
  isReviewSubmitted,
} from "@/lib/contractor/review-display";
import { displayContractorName } from "@/lib/contractor/display-contractor";
import { parseReviewScopeSnapshot } from "@/lib/contractor/review-scope-snapshot";
import type { ReviewedScopeSummary } from "@/lib/contractor/reviewed-scopes";
import { SHARE_LINK_PLACEHOLDER_EMAIL } from "@/lib/contractor/project-share";
import { formatProposalRange } from "@/lib/estimates/money";
import type { ContractorEstimate, ProjectWithScope, ScopeItem, ScopeSuggestionWithMeta } from "@/types";
import type { SharedPhoto } from "@/lib/phase2/client";

function formatReviewFeedbackLine(
  entries: Array<{ suggestion_type: string }>
) {
  const commentCount = entries.filter(
    (entry) => entry.suggestion_type !== "add"
  ).length;
  const suggestionCount = entries.filter(
    (entry) => entry.suggestion_type === "add"
  ).length;
  const parts = [
    commentCount > 0
      ? `${commentCount} comment${commentCount === 1 ? "" : "s"}`
      : null,
    suggestionCount > 0
      ? `${suggestionCount} suggestion${suggestionCount === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : null;
}

function ReviewEstimateColumns({
  rail,
  children,
  className,
}: {
  rail: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-10">
      <aside className="mb-6 min-w-0 lg:order-2 lg:mb-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        {rail}
      </aside>
      <div className={cn("min-w-0 lg:order-1", className)}>{children}</div>
    </div>
  );
}

export function ReviewedScopeDetail({
  projectId,
  project,
  scope,
  suggestions,
  currentSummary,
  currentScopeItems,
  estimate,
  photos = [],
}: {
  projectId: string;
  project: ProjectWithScope;
  scope: ReviewedScopeSummary;
  suggestions: ScopeSuggestionWithMeta[];
  currentSummary: string | null;
  currentScopeItems: ScopeItem[];
  estimate?: ContractorEstimate | null;
  photos?: SharedPhoto[];
}) {
  const router = useRouter();
  const { invitation } = scope;
  const submitted = isReviewSubmitted(invitation);
  const submittedLabel = formatReviewDate(invitation.review?.submitted_at);
  const hasProposal =
    estimate != null && (estimate.line_items?.length ?? 0) > 0;
  const showEmail =
    invitation.contractor_email !== SHARE_LINK_PLACEHOLDER_EMAIL ||
    Boolean(invitation.accepted_at);
  const identityParts = [
    submitted ? submittedLabel : null,
    showEmail ? invitation.contractor_email : null,
    showEmail && invitation.contractor_company
      ? invitation.contractor_company
      : null,
  ].filter(Boolean);
  const scopeSnapshot = parseReviewScopeSnapshot(
    invitation.review?.scope_snapshot ?? null
  );
  const feedbackLine = formatReviewFeedbackLine(
    scopeSnapshot?.suggestions ?? suggestions
  );
  const statusParts = [
    scope.is_selected_proposal ? "Proposal accepted" : null,
    scope.estimate_status === "declined" && invitation.status !== "closed_out"
      ? "Estimate rejected"
      : scope.estimate_status === "declined"
        ? "Not selected"
        : null,
    !hasProposal &&
    scope.proposal_min_total != null &&
    scope.proposal_max_total != null
      ? `Proposal ${formatProposalRange(scope.proposal_min_total, scope.proposal_max_total)}`
      : null,
    feedbackLine,
  ].filter(Boolean);

  const showAcceptedLayout = scope.is_selected_proposal && estimate != null;
  const projectCrumbLabel = project.title.trim() || "Project";
  const contractorNotes = invitation.review?.notes ?? null;

  const scopeColumn = (
    <ReviewedScopeSnapshotView
      projectId={projectId}
      snapshot={scopeSnapshot}
      currentSummary={currentSummary}
      currentItems={currentScopeItems}
      contractorName={displayContractorName(invitation)}
      suggestions={suggestions}
      estimate={estimate}
      contractorNotes={contractorNotes}
      belowNotes={
        showAcceptedLayout ? <SharedPhotoGallery photos={photos} /> : undefined
      }
      onUpdated={() => router.refresh()}
    />
  );

  return (
    <div className="space-y-8">
      <PageBreadcrumbHeader
        breadcrumb={
          <BreadcrumbNav>
            <BreadcrumbLink href={`/projects/${project.id}`}>
              {projectCrumbLabel}
            </BreadcrumbLink>
          </BreadcrumbNav>
        }
      >
        {showAcceptedLayout ? (
          <AcceptedProjectHeader project={project} />
        ) : (
          <div className="space-y-2">
            <h1 className="font-display text-4xl tracking-tight text-neutral-900">
              {formatReviewedScopeHeadline(invitation, submitted)}
            </h1>
            {identityParts.length > 0 ? (
              <p className="text-sm text-[var(--muted)]">
                {identityParts.join(" · ")}
              </p>
            ) : null}
            {statusParts.length > 0 ? (
              <p className="text-sm text-[var(--muted)]">
                {statusParts.join(" · ")}
              </p>
            ) : null}
          </div>
        )}
      </PageBreadcrumbHeader>

      {showAcceptedLayout && estimate ? (
        <ReviewEstimateColumns
          rail={
            <AcceptedProjectEstimateSection
              estimate={estimate}
              audience="homeowner"
            />
          }
        >
          {scopeColumn}
        </ReviewEstimateColumns>
      ) : estimate ? (
        <ProposalAcceptDockProvider
          projectId={projectId}
          invitationId={invitation.id}
          estimate={estimate}
          projectHasSelectedProposal={scope.project_has_selected_proposal}
          isSelectedProposal={scope.is_selected_proposal}
          invitationStatus={invitation.status}
          contractorName={displayContractorName(invitation)}
        >
          <ReviewEstimateColumns
            rail={<ProposalEstimateHeaderSection layout="rail" />}
            className="max-lg:pb-40"
          >
            {scopeColumn}
          </ReviewEstimateColumns>
        </ProposalAcceptDockProvider>
      ) : (
        scopeColumn
      )}
    </div>
  );
}
