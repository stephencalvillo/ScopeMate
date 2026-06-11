import type { ContractorEstimate } from "@/types";

export type ProjectAcceptedProposalSummary = {
  estimate: ContractorEstimate;
  invitationId: string;
  contractorName: string;
  contractorCompany: string | null;
  rangeLabel: string;
  acceptedAtLabel: string | null;
};
