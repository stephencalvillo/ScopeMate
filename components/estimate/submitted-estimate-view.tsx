import { PageSection, SectionSurface } from "@/components/layout/page-section";
import {
  displaySectionEstimateLabel,
  parseSectionEstimateCategory,
} from "@/lib/estimates/inline-estimate";
import {
  ESTIMATE_DISCLAIMER,
  PROPOSAL_DISCLAIMER,
  estimateRangeBounds,
  formatCurrency,
  formatProposalRange,
  proposalRangeFromLineItems,
} from "@/lib/estimates/money";
import type { ContractorEstimate } from "@/types";

function lineItemLabel(description: string) {
  const category = parseSectionEstimateCategory(description);
  if (category) {
    return `${displaySectionEstimateLabel(category)} (section)`;
  }
  return description;
}

export function SubmittedEstimateView({
  estimate,
}: {
  estimate: ContractorEstimate;
}) {
  const lineItems = estimate.line_items ?? [];

  if (lineItems.length === 0) {
    return null;
  }

  const { minTotal, maxTotal } = proposalRangeFromLineItems(lineItems);

  return (
    <PageSection
      title="Proposal"
      description="Submitted by the contractor. Not a final quote until verified on site."
    >
      <SectionSurface className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">Project total</p>
          <p className="font-display text-3xl tracking-tight text-neutral-900">
            {formatProposalRange(minTotal, maxTotal)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="hidden gap-3 text-xs font-medium text-[var(--muted)] md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
            <span>Item</span>
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1">Range</span>
              <span className="w-4 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1" aria-hidden />
            </div>
          </div>

          {lineItems.map((item) => {
            const { low, high } = estimateRangeBounds(
              item.labor_cost,
              item.material_cost
            );

            return (
            <div
              key={item.id}
              className="grid gap-3 border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] md:items-center"
            >
              <p className="text-sm text-neutral-900">{lineItemLabel(item.description)}</p>
              <div className="flex items-center gap-2 text-sm text-neutral-800">
                <span>{formatCurrency(low)}</span>
                <span className="h-px w-4 shrink-0 bg-neutral-300" aria-hidden />
                <span>{formatCurrency(high)}</span>
              </div>
            </div>
            );
          })}
        </div>

        <p className="text-xs text-[var(--muted)]">{PROPOSAL_DISCLAIMER}</p>
      </SectionSurface>
    </PageSection>
  );
}

export function EstimateDisclaimerNote() {
  return (
    <p className="text-xs text-[var(--muted)]">{ESTIMATE_DISCLAIMER}</p>
  );
}
