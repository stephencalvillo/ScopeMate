import { redirect } from "next/navigation";
import { ContractorPortfolio } from "@/components/contractor/contractor-portfolio";
import { ensureUserRecord } from "@/lib/auth/clerk";
import {
  completeContractorSetupIfReady,
  listContractorReviews,
  partitionContractorReviews,
} from "@/lib/contractor/profile";

export default async function ContractorDashboardPage() {
  const user = await ensureUserRecord();
  const { profile, ready } = await completeContractorSetupIfReady(user);

  if (!ready || !profile) {
    redirect("/contractor/onboarding");
  }

  const { accepted, inReview, history } = partitionContractorReviews(
    await listContractorReviews(user.id)
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-4xl tracking-tight text-neutral-900">
          Your projects
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {profile.company_name
            ? `${profile.company_name} · `
            : ""}
          Track active jobs, reviews in progress, and past proposals.
        </p>
      </div>

      <ContractorPortfolio
        accepted={accepted}
        inReview={inReview}
        history={history}
      />
    </div>
  );
}
