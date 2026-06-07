"use client";

import { useMemo, useState } from "react";
import { ContractorEstimateProvider } from "@/components/estimate/contractor-estimate-context";
import {
  AcceptedProposalProjectView,
  ContractorProjectDetailView,
} from "@/components/review/accepted-proposal-project-view";
import { ContractorReviewEstimateBody } from "@/components/review/contractor-review-estimate-body";
import { ProjectReadinessSummary } from "@/components/review/project-readiness-summary";
import { SharedPhotoGallery } from "@/components/share/shared-photo-gallery";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { MyProjectsBreadcrumb } from "@/components/layout/my-projects-breadcrumb";
import { PageBreadcrumbHeader } from "@/components/layout/page-breadcrumb-header";
import type { SharedPhoto } from "@/lib/phase2/client";
import type { ProjectReadinessSummary as ProjectReadinessSummaryData } from "@/lib/project/readiness-summary";
import {
  formatProjectTypeLabel,
  type ContractorInvitation,
  type ContractorEstimate,
  type ContractorReview,
  type ProjectWithScope,
  type ScopeSuggestion,
  type SuggestionFollowUp,
} from "@/types";

type ReviewSuggestion = ScopeSuggestion & { follow_ups?: SuggestionFollowUp[] };

type ReviewPayload = {
  invitation: ContractorInvitation;
  review: ContractorReview;
  project: ProjectWithScope;
  photos: SharedPhoto[];
  readiness: ProjectReadinessSummaryData;
  suggestions: ReviewSuggestion[];
  estimate?: ContractorEstimate | null;
  can_edit: boolean;
};

export function ContractorReviewWorkspace({
  token,
  payload,
  onRefresh,
  onReviewSubmitted,
}: {
  token: string;
  payload: ReviewPayload;
  onRefresh: () => void;
  onReviewSubmitted: () => void | Promise<void>;
}) {
  const { invitation, review, project, photos, readiness, estimate = null } = payload;
  const [suggestions, setSuggestions] = useState(payload.suggestions);
  const [notes, setNotes] = useState(review.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const reviewSubmitted = review.status === "submitted";
  const editable = payload.can_edit && !reviewSubmitted;
  const proposalAccepted = estimate?.status === "accepted";
  const projectClosed =
    invitation.status === "closed_out" || estimate?.status === "declined";

  const draftAddSuggestions = useMemo(
    () =>
      suggestions.filter(
        (entry) =>
          entry.suggestion_type === "add" && entry.status === "draft"
      ),
    [suggestions]
  );

  const breadcrumb = <MyProjectsBreadcrumb href="/contractor" />;

  if (proposalAccepted && estimate) {
    return (
      <AcceptedProposalProjectView
        breadcrumb={breadcrumb}
        project={project}
        photos={photos}
        readiness={readiness}
        estimate={estimate}
        notes={notes}
        audience="contractor"
      />
    );
  }

  if (reviewSubmitted) {
    return (
      <ContractorProjectDetailView
        breadcrumb={breadcrumb}
        project={project}
        photos={photos}
        readiness={readiness}
        estimate={estimate}
        notes={notes}
        audience="contractor"
        statusBadge={
          projectClosed
            ? { label: "Project closed", variant: "secondary" }
            : { label: "Review submitted", variant: "info" }
        }
        estimateMode={projectClosed ? "plain" : "submitted"}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageBreadcrumbHeader breadcrumb={breadcrumb}>
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">
            Reviewing as {invitation.contractor_name}
            {invitation.contractor_company
              ? ` · ${invitation.contractor_company}`
              : ""}
          </p>
          <h1 className="font-display text-4xl tracking-tight text-neutral-900">
            {project.title}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {formatProjectTypeLabel(project.project_type)}
          </p>
        </div>
      </PageBreadcrumbHeader>

      <ProjectReadinessSummary readiness={readiness} />

      <ScopeSummary summary={project.ai_summary} />

      <SharedPhotoGallery photos={photos} />

      <ContractorEstimateProvider
        token={token}
        scopeItems={project.scope_items}
        editable={editable}
        reviewSubmitted={reviewSubmitted}
        initialEstimate={estimate}
        draftAddSuggestions={draftAddSuggestions}
      >
        <ContractorReviewEstimateBody
          token={token}
          items={project.scope_items}
          suggestions={suggestions}
          editable={editable}
          notes={notes}
          onNotesChange={setNotes}
          onSuggestionsChange={setSuggestions}
          onRefresh={onRefresh}
          onError={setError}
          onReviewSubmitted={onReviewSubmitted}
        />
      </ContractorEstimateProvider>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
