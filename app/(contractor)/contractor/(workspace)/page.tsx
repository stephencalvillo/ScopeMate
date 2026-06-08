import { redirect } from "next/navigation";
import { ContractorPortfolio } from "@/components/contractor/contractor-portfolio";
import { ensureUserRecord } from "@/lib/auth/clerk";
import {
  completeContractorSetupIfReady,
  listContractorReviews,
  partitionContractorReviews,
} from "@/lib/contractor/profile";
import { listContractorClientProjects } from "@/lib/db/projects";

export default async function ContractorDashboardPage() {
  const user = await ensureUserRecord();
  const { profile, ready } = await completeContractorSetupIfReady(user);

  if (!ready || !profile) {
    redirect("/contractor/onboarding");
  }

  const [clientProjects, reviews] = await Promise.all([
    listContractorClientProjects(user.id),
    listContractorReviews(user.id),
  ]);
  const { accepted, inReview, history } = partitionContractorReviews(reviews);

  return (
    <div className="space-y-8 pt-6">
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
        clientProjects={clientProjects}
        accepted={accepted}
        inReview={inReview}
        history={history}
      />
    </div>
  );
}
