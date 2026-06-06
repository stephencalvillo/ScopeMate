"use client";

import { useContractorEstimate } from "@/components/estimate/contractor-estimate-context";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import {
  ESTIMATE_DISCLAIMER,
  PROPOSAL_DISCLAIMER,
  formatCurrency,
} from "@/lib/estimates/money";

export function ContractorEstimateBar() {
  const {
    loading,
    generating,
    showEstimate,
    submitted,
    computedMinTotal,
    computedMaxTotal,
    message,
    error,
  } = useContractorEstimate();

  if (loading || generating || !showEstimate) {
    return null;
  }

  const hasRange = computedMinTotal > 0 || computedMaxTotal > 0;

  return (
    <PageSection title={submitted ? "Proposal total" : "Draft proposal total"}>
      <SectionSurface className="space-y-2">
        {hasRange ? (
          <div className="flex items-center gap-2 font-display text-2xl tracking-tight text-neutral-900">
            <span>{formatCurrency(computedMinTotal)}</span>
            <span className="h-px w-4 shrink-0 bg-neutral-300" aria-hidden />
            <span>{formatCurrency(computedMaxTotal)}</span>
          </div>
        ) : (
          <p className="font-display text-2xl tracking-tight text-[var(--muted)]">
            —
          </p>
        )}
        <p className="text-sm text-[var(--muted)]">
          {submitted ? PROPOSAL_DISCLAIMER : ESTIMATE_DISCLAIMER}
        </p>
      </SectionSurface>

      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </PageSection>
  );
}
