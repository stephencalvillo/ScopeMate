import { PublicShell } from "@/components/layout/public-shell";
import { ContractorReviewPage } from "@/components/review/contractor-review-page";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <PublicShell
      subtitle="Contractor review"
      logoHref="/contractors"
      learnMoreHref="/contractors"
    >
      <ContractorReviewPage token={token} />
    </PublicShell>
  );
}
