import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SectionSurface } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import type { ProjectAcceptedProposalSummary } from "@/lib/estimates/proposal-decision-types";

export function AcceptedProposalSummary({
  projectId,
  summary,
}: {
  projectId: string;
  summary: ProjectAcceptedProposalSummary;
}) {
  const detailParts = [
    summary.rangeLabel ? `Proposal ${summary.rangeLabel}` : null,
    summary.acceptedAtLabel ? `Accepted ${summary.acceptedAtLabel}` : null,
  ].filter(Boolean);

  return (
    <SectionSurface className="space-y-3 border-emerald-200 bg-emerald-50/60">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success">Proposal accepted</Badge>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-900">
            You selected {summary.contractorName}
            {summary.contractorCompany ? ` · ${summary.contractorCompany}` : ""}
          </p>
          {detailParts.length > 0 ? (
            <p className="text-sm text-neutral-800">{detailParts.join(" · ")}</p>
          ) : null}
          <p className="text-sm text-[var(--muted)]">
            Other submitted proposals were declined. Contractors have been
            notified.
          </p>
        </div>
        <Link
          href={`/projects/${projectId}/reviews/${summary.invitationId}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-neutral-900 hover:underline"
        >
          View proposal
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </SectionSurface>
  );
}
