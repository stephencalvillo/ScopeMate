import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ContractorShell } from "@/components/contractor/contractor-shell";
import { PublicShell } from "@/components/layout/public-shell";
import { ContractorReviewPage } from "@/components/review/contractor-review-page";
import { REVIEW_SESSION_COOKIE } from "@/lib/contractor/constants";
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
      const cookieStore = await cookies();
      cookieStore.delete(REVIEW_SESSION_COOKIE);
      redirect(homeownerRedirect);
    }
  }

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
