import { notFound, redirect } from "next/navigation";
import { ContractorBidDetailView } from "@/components/contractor/contractor-bid-detail-view";
import { ForbiddenError, NotFoundError, ensureUserRecord } from "@/lib/auth/clerk";
import { getContractorBidDetail } from "@/lib/contractor/bid-history";
import { completeContractorSetupIfReady } from "@/lib/contractor/profile";

export default async function ContractorBidDetailPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  const user = await ensureUserRecord();
  const { profile, ready } = await completeContractorSetupIfReady(user);

  if (!ready || !profile) {
    redirect("/contractor/onboarding");
  }

  try {
    const bid = await getContractorBidDetail(user.id, invitationId);
    return <ContractorBidDetailView bid={bid} />;
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    if (error instanceof ForbiddenError) {
      redirect("/contractor");
    }
    throw error;
  }
}
