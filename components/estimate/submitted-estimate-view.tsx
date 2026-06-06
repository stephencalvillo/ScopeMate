import { PageSection, SectionSurface } from "@/components/layout/page-section";
import {
  ESTIMATE_DISCLAIMER,
  PROPOSAL_DISCLAIMER,
  formatProposalRange,
  proposalRangeFromLineItems,
} from "@/lib/estimates/money";
import type { ContractorEstimate } from "@/types";

export function ProjectEstimateSummary({
  estimate,
}: {
  estimate: ContractorEstimate;
}) {
  const lineItems = estimate.line_items ?? [];

  if (lineItems.length === 0) {
    return null;
  }

  const { minTotal, maxTotal } = proposalRangeFromLineItems(lineItems);
  const rangeLabel = formatProposalRange(minTotal, maxTotal);

  if (!rangeLabel) {
    return null;
  }

  return (
    <PageSection title="Project estimate">
      <SectionSurface className="space-y-2">
        <p className="font-display text-3xl tracking-tight text-neutral-900">
          {rangeLabel}
        </p>
        <p className="text-sm text-[var(--muted)]">{PROPOSAL_DISCLAIMER}</p>
      </SectionSurface>
    </PageSection>
  );
}

/** @deprecated Use ProjectEstimateSummary */
export function SubmittedEstimateView({
  estimate,
}: {
  estimate: ContractorEstimate;
}) {
  return <ProjectEstimateSummary estimate={estimate} />;
}

export function EstimateDisclaimerNote() {
  return (
    <p className="text-xs text-[var(--muted)]">{ESTIMATE_DISCLAIMER}</p>
  );
}
