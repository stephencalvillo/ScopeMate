"use client";

import Link from "next/link";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { displayContractorName } from "@/lib/contractor/display-contractor";
import { isReviewSubmitted } from "@/lib/contractor/review-display";
import type { ReviewedScopeSummary } from "@/lib/contractor/reviewed-scopes";
import { PROPOSAL_DISCLAIMER, formatProposalRange } from "@/lib/estimates/money";

export function scopeHasProposal(scope: ReviewedScopeSummary) {
  return (scope.proposal_min_total ?? 0) > 0 || (scope.proposal_max_total ?? 0) > 0;
}

export function ProposalComparisonSection({
  projectId,
  scopes,
  embedded = false,
}: {
  projectId: string;
  scopes: ReviewedScopeSummary[];
  embedded?: boolean;
}) {
  const comparable = scopes
    .filter(scopeHasProposal)
    .filter((scope) => isReviewSubmitted(scope.invitation))
    .sort(
      (left, right) =>
        (left.proposal_min_total ?? 0) - (right.proposal_min_total ?? 0)
    );

  if (comparable.length < 2) {
    return null;
  }

  const table = (
    <SectionSurface className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-xs font-medium text-[var(--muted)]">
            <th className="pb-3 pr-4 font-medium">Contractor</th>
            <th className="pb-3 pr-4 font-medium">Proposal range</th>
            <th className="pb-3 font-medium">
              <span className="sr-only">View proposal</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {comparable.map((scope) => {
            const range = formatProposalRange(
              scope.proposal_min_total ?? 0,
              scope.proposal_max_total ?? 0
            );

            return (
              <tr
                key={scope.invitation.id}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <td className="py-3 pr-4 align-top">
                  <p className="font-medium text-neutral-900">
                    {displayContractorName(scope.invitation)}
                  </p>
                  {scope.invitation.contractor_company ? (
                    <p className="text-[var(--muted)]">
                      {scope.invitation.contractor_company}
                    </p>
                  ) : null}
                </td>
                <td className="py-3 pr-4 align-top font-display text-lg tracking-tight text-neutral-900">
                  {range}
                </td>
                <td className="py-3 align-top text-right">
                  <Link
                    href={`/projects/${projectId}/reviews/${scope.invitation.id}`}
                    className="text-sm font-medium text-neutral-900 underline-offset-4 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-[var(--muted)]">{PROPOSAL_DISCLAIMER}</p>
    </SectionSurface>
  );

  if (embedded) {
    return (
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-medium text-neutral-900">
            Compare proposals
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Side-by-side proposal ranges from contractors who submitted pricing.
          </p>
        </div>
        {table}
      </div>
    );
  }

  return (
    <PageSection
      title="Compare proposals"
      description="Side-by-side proposal ranges from contractors who submitted pricing."
    >
      {table}
    </PageSection>
  );
}
