"use client";

import { useRouter } from "next/navigation";
import { SharedPhotoGallery } from "@/components/share/shared-photo-gallery";
import {
  AcceptedProjectEstimateSection,
  AcceptedProjectHeader,
} from "@/components/review/accepted-proposal-project-view";
import {
  ProposalAcceptDockProvider,
  ProposalEstimateEndSection,
  ProposalEstimateHeaderSection,
} from "@/components/estimate/proposal-decision-panel";
import { ReviewedScopeSnapshotView } from "@/components/review/reviewed-scope-snapshot-view";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { MyProjectsBreadcrumb } from "@/components/layout/my-projects-breadcrumb";
import { PageBreadcrumbHeader } from "@/components/layout/page-breadcrumb-header";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
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
  const metaParts = [
    submitted ? submittedLabel : null,
    scope.is_selected_proposal ? "Proposal accepted" : null,
    scope.estimate_status === "declined" ? "Not selected" : null,
    !hasProposal &&
    scope.proposal_min_total != null &&
    scope.proposal_max_total != null
      ? `Proposal ${formatProposalRange(scope.proposal_min_total, scope.proposal_max_total)}`
      : null,
    scope.total_suggestion_count > 0
      ? `${scope.total_suggestion_count} suggestion${
          scope.total_suggestion_count === 1 ? "" : "s"
        }`
      : null,
  ].filter(Boolean);

  const scopeSnapshot = parseReviewScopeSnapshot(
    invitation.review?.scope_snapshot ?? null
  );

  const showEmail =
    invitation.contractor_email !== SHARE_LINK_PLACEHOLDER_EMAIL ||
    Boolean(invitation.accepted_at);

  const showAcceptedLayout = scope.is_selected_proposal && estimate != null;

  return (
    <div className="space-y-8">
      <PageBreadcrumbHeader breadcrumb={<MyProjectsBreadcrumb href="/projects" />}>
        {showAcceptedLayout ? (
          <AcceptedProjectHeader project={project} />
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-4xl tracking-tight text-neutral-900">
                {formatReviewedScopeHeadline(invitation, submitted)}
              </h1>
              {scope.pending_suggestion_count > 0 ? (
                <Badge variant="pending">
                  {scope.pending_suggestion_count} pending
                </Badge>
              ) : null}
            </div>
            {showEmail ? (
              <p className="text-sm text-[var(--muted)]">
                {invitation.contractor_email}
                {invitation.contractor_company
                  ? ` · ${invitation.contractor_company}`
                  : ""}
              </p>
            ) : null}
            {metaParts.length > 0 ? (
              <p className="text-sm text-[var(--muted)]">
                {metaParts.join(" · ")}
              </p>
            ) : null}
          </div>
        )}
      </PageBreadcrumbHeader>

      {showAcceptedLayout ? (
        <>
          <AcceptedProjectEstimateSection
            estimate={estimate}
            audience="homeowner"
          />
          <ScopeSummary summary={currentSummary} />
          <SharedPhotoGallery photos={photos} />
          <ReviewedScopeSnapshotView
            projectId={projectId}
            snapshot={scopeSnapshot}
            currentSummary={currentSummary}
            currentItems={currentScopeItems}
            submittedLabel={submittedLabel}
            contractorName={displayContractorName(invitation)}
            suggestions={suggestions}
            estimate={estimate}
            onUpdated={() => router.refresh()}
          />
        </>
      ) : estimate ? (
        <ProposalAcceptDockProvider
          projectId={projectId}
          invitationId={invitation.id}
          estimate={estimate}
          projectHasSelectedProposal={scope.project_has_selected_proposal}
          isSelectedProposal={scope.is_selected_proposal}
        >
          <ProposalEstimateHeaderSection />

          <ReviewedScopeSnapshotView
            projectId={projectId}
            snapshot={scopeSnapshot}
            currentSummary={currentSummary}
            currentItems={currentScopeItems}
            submittedLabel={submittedLabel}
            contractorName={displayContractorName(invitation)}
            suggestions={suggestions}
            estimate={estimate}
            onUpdated={() => router.refresh()}
          />

          <ProposalEstimateEndSection />
        </ProposalAcceptDockProvider>
      ) : (
        <ReviewedScopeSnapshotView
          projectId={projectId}
          snapshot={scopeSnapshot}
          currentSummary={currentSummary}
          currentItems={currentScopeItems}
          submittedLabel={submittedLabel}
          contractorName={displayContractorName(invitation)}
          suggestions={suggestions}
          estimate={estimate}
          onUpdated={() => router.refresh()}
        />
      )}

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
