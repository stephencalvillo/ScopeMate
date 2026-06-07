import { MapPin } from "lucide-react";
import { ProposalDisclaimerInfo } from "@/components/estimate/proposal-disclaimer-info";
import { ReadOnlyProposalEstimate } from "@/components/contractor/read-only-proposal-estimate";
import { SharedPhotoGallery } from "@/components/share/shared-photo-gallery";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { PageBreadcrumbHeader } from "@/components/layout/page-breadcrumb-header";
import { Badge } from "@/components/ui/badge";
import { formatReviewDate } from "@/lib/contractor/review-display";
import { formatProjectLocation } from "@/lib/location/parse";
import {
  formatProposalRange,
  proposalRangeFromLineItems,
} from "@/lib/estimates/money";
import type { ReactNode } from "react";
import type { SharedPhoto } from "@/lib/phase2/client";
import { formatProjectTypeLabel, type ContractorEstimate, type ProjectWithScope } from "@/types";

type StatusBadge = {
  label: string;
  variant: "success" | "info" | "secondary";
};

type EstimateMode = "accepted" | "submitted" | "plain";

export function ContractorProjectHeader({
  project,
  statusBadge,
}: {
  project: ProjectWithScope;
  statusBadge?: StatusBadge | null;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-4xl tracking-tight text-neutral-900">
          {project.title}
        </h1>
        {statusBadge ? (
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        ) : null}
      </div>
      <p className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
        <span>{formatProjectTypeLabel(project.project_type)}</span>
        <span aria-hidden>{"\u00b7"}</span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          {formatProjectLocation(project)}
        </span>
      </p>
    </div>
  );
}

export function AcceptedProjectHeader({ project }: { project: ProjectWithScope }) {
  return <ContractorProjectHeader project={project} />;
}

function ContractorProjectEstimateSection({
  estimate,
  audience,
  mode,
  statusBadge,
}: {
  estimate: ContractorEstimate;
  audience: "homeowner" | "contractor";
  mode: EstimateMode;
  statusBadge?: StatusBadge | null;
}) {
  const lineItems = estimate.line_items ?? [];
  const { minTotal, maxTotal } = proposalRangeFromLineItems(lineItems);
  const rangeLabel = formatProposalRange(minTotal, maxTotal);

  if (!rangeLabel) {
    return null;
  }

  const acceptedAtLabel = formatReviewDate(estimate.accepted_at);
  const submittedAtLabel = formatReviewDate(estimate.submitted_at);

  const detailParts =
    mode === "accepted"
      ? [acceptedAtLabel ? `Accepted ${acceptedAtLabel}` : null].filter(Boolean)
      : mode === "submitted"
        ? [submittedAtLabel ? `Submitted ${submittedAtLabel}` : null].filter(Boolean)
        : [];

  const surfaceClassName =
    mode === "accepted"
      ? "space-y-3 border-emerald-200 bg-emerald-50/60"
      : mode === "submitted"
        ? "space-y-3 border-blue-200 bg-blue-50/60"
        : "space-y-3";

  const estimateStatusBadge =
    mode === "accepted"
      ? { label: "Proposal accepted", variant: "success" as const }
      : mode === "submitted"
        ? (statusBadge ?? { label: "Review submitted", variant: "info" as const })
        : null;

  const description =
    mode === "accepted"
      ? audience === "contractor"
        ? "The homeowner accepted your proposal. This project is now read-only."
        : "You selected this contractor's proposal. Other contractors have been notified."
      : mode === "submitted"
        ? "The homeowner can see your scope feedback, notes, and proposal."
        : null;

  return (
    <PageSection title="Project estimate">
      <SectionSurface className={surfaceClassName}>
        {estimateStatusBadge ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={estimateStatusBadge.variant}>
              {estimateStatusBadge.label}
            </Badge>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-3xl tracking-tight text-neutral-900">
            {rangeLabel}
          </p>
          <ProposalDisclaimerInfo />
        </div>
        {detailParts.length > 0 ? (
          <p className="text-sm text-neutral-800">{detailParts.join(" · ")}</p>
        ) : null}
        {description ? (
          <p className="text-sm text-neutral-800">{description}</p>
        ) : null}
      </SectionSurface>
    </PageSection>
  );
}

export function AcceptedProjectEstimateSection({
  estimate,
  audience,
}: {
  estimate: ContractorEstimate;
  audience: "homeowner" | "contractor";
}) {
  return (
    <ContractorProjectEstimateSection
      estimate={estimate}
      audience={audience}
      mode="accepted"
    />
  );
}

export function ContractorProjectDetailView({
  project,
  photos,
  estimate,
  notes,
  audience,
  statusBadge,
  estimateMode,
  breadcrumb,
}: {
  project: ProjectWithScope;
  photos: SharedPhoto[];
  estimate?: ContractorEstimate | null;
  notes?: string | null;
  audience: "homeowner" | "contractor";
  statusBadge?: StatusBadge | null;
  estimateMode: EstimateMode;
  breadcrumb?: ReactNode;
}) {
  const hasProposal =
    estimate != null && (estimate.line_items?.length ?? 0) > 0;
  const showStatusInEstimateCard =
    hasProposal && (estimateMode === "accepted" || estimateMode === "submitted");

  const projectHeader = (
    <ContractorProjectHeader
      project={project}
      statusBadge={showStatusInEstimateCard ? null : statusBadge}
    />
  );

  return (
    <div className="space-y-8">
      {breadcrumb ? (
        <PageBreadcrumbHeader breadcrumb={breadcrumb}>{projectHeader}</PageBreadcrumbHeader>
      ) : (
        projectHeader
      )}

      {hasProposal && estimate ? (
        <ContractorProjectEstimateSection
          estimate={estimate}
          audience={audience}
          mode={estimateMode}
          statusBadge={estimateMode === "submitted" ? statusBadge : null}
        />
      ) : null}

      <ScopeSummary summary={project.ai_summary} />

      <SharedPhotoGallery photos={photos} />

      {hasProposal && estimate ? (
        <ReadOnlyProposalEstimate
          scopeItems={project.scope_items}
          estimate={estimate}
        />
      ) : null}

      {notes?.trim() ? (
        <PageSection title="General notes">
          <SectionSurface>
            <p className="whitespace-pre-wrap text-sm text-neutral-800">
              {notes}
            </p>
          </SectionSurface>
        </PageSection>
      ) : null}
    </div>
  );
}

export function AcceptedProposalProjectView({
  project,
  photos,
  estimate,
  notes,
  audience,
  breadcrumb,
}: {
  project: ProjectWithScope;
  photos: SharedPhoto[];
  estimate: ContractorEstimate;
  notes?: string | null;
  audience: "homeowner" | "contractor";
  breadcrumb?: ReactNode;
}) {
  return (
    <ContractorProjectDetailView
      project={project}
      photos={photos}
      estimate={estimate}
      notes={notes}
      audience={audience}
      estimateMode="accepted"
      breadcrumb={breadcrumb}
    />
  );
}
