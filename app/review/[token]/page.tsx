import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ContractorShell } from "@/components/contractor/contractor-shell";
import { PublicShell } from "@/components/layout/public-shell";
import { ContractorReviewPage } from "@/components/review/contractor-review-page";
import { HomeownerReviewRedirect } from "@/components/review/homeowner-review-redirect";
import { getInvitationByToken } from "@/lib/contractor/invitations";
import { getHomeownerReviewRedirect } from "@/lib/contractor/review-homeowner-redirect";

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
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ as?: string }>;
}) {
  const { token } = await params;
  const { as } = await searchParams;

  if (as !== "contractor") {
    const homeownerRedirect = await getHomeownerReviewRedirect(token);
    if (homeownerRedirect) {
      redirect(homeownerRedirect);
    }
  }

  const content = (
    <>
      <Suspense fallback={null}>
        <HomeownerReviewRedirect token={token} />
        <ContractorReviewPage token={token} />
      </Suspense>
    </>
  );

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
