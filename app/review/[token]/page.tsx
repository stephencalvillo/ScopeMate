import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ContractorShell } from "@/components/contractor/contractor-shell";
import { PublicShell } from "@/components/layout/public-shell";
import { ContractorReviewPage } from "@/components/review/contractor-review-page";
import { HomeownerReviewRedirect } from "@/components/review/homeowner-review-redirect";
import { resolveClerkUserIdFromHeaders } from "@/lib/auth/clerk";
import { getInvitationByToken } from "@/lib/contractor/invitations";
import { getHomeownerReviewRedirect } from "@/lib/contractor/review-homeowner-redirect";

async function reviewPageRequest() {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const cookie = headersList.get("cookie");

  if (!host || !cookie) {
    return undefined;
  }

  return new Request(`${proto}://${host}/`, {
    headers: { cookie },
  });
}

async function useContractorShellForReview(token: string) {
  const { userId: authUserId } = await auth();
  const userId = authUserId ?? (await resolveClerkUserIdFromHeaders());
  if (!userId) {
    return false;
  }

  try {
    const request = await reviewPageRequest();
    const invitation = await getInvitationByToken(token, request);
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
