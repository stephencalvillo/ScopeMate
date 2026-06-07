import { auth } from "@clerk/nextjs/server";
import { ContractorShell } from "@/components/contractor/contractor-shell";
import { PublicShell } from "@/components/layout/public-shell";
import { ContractorReviewPage } from "@/components/review/contractor-review-page";
import { getInvitationByToken } from "@/lib/contractor/invitations";

async function useContractorShellForReview(token: string) {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }

  try {
    const invitation = await getInvitationByToken(token);
    return invitation.contractor_user_id === userId;
  } catch {
    return false;
  }
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const content = <ContractorReviewPage token={token} />;

  if (await useContractorShellForReview(token)) {
    return <ContractorShell>{content}</ContractorShell>;
  }

  return (
    <PublicShell
      subtitle="Contractor review"
      logoHref="/contractors"
      learnMoreHref="/contractors"
    >
      {content}
    </PublicShell>
  );
}
