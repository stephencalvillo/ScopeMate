export function isExplicitEstimateRejection({
  estimateStatus,
  invitationStatus,
}: {
  estimateStatus?: string | null;
  invitationStatus?: string | null;
}) {
  return estimateStatus === "declined" && invitationStatus !== "closed_out";
}
