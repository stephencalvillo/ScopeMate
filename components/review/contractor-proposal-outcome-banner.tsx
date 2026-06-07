import { Badge } from "@/components/ui/badge";
import { SectionSurface } from "@/components/layout/page-section";
import type { ContractorEstimate, ContractorInvitation } from "@/types";

export function ContractorProposalOutcomeBanner({
  invitation,
  estimate,
  reviewSubmitted = false,
}: {
  invitation: Pick<ContractorInvitation, "status">;
  estimate?: ContractorEstimate | null;
  reviewSubmitted?: boolean;
}) {
  if (estimate?.status === "accepted") {
    return (
      <SectionSurface className="space-y-2 border-emerald-200 bg-emerald-50/60">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Proposal accepted</Badge>
        </div>
        <p className="text-sm text-neutral-800">
          The homeowner accepted your proposal. This project is now read-only.
        </p>
      </SectionSurface>
    );
  }

  if (invitation.status === "closed_out" || estimate?.status === "declined") {
    return (
      <SectionSurface className="space-y-2 border-neutral-200 bg-neutral-50">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Project closed</Badge>
        </div>
        <p className="text-sm text-neutral-800">
          The homeowner selected another contractor for this project. Your review
          and proposal remain visible here for reference, but this project is
          closed.
        </p>
      </SectionSurface>
    );
  }

  if (reviewSubmitted) {
    return (
      <SectionSurface className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">Review submitted</Badge>
        </div>
        <p className="text-sm text-neutral-800">
          The homeowner can see your scope feedback, notes, and proposal. You
          can leave this page anytime.
        </p>
      </SectionSurface>
    );
  }

  return null;
}
