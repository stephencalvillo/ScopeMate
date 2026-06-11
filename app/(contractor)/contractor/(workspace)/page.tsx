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
    <ContractorPortfolio
      clientProjects={clientProjects}
      accepted={accepted}
      inReview={inReview}
      history={history}
    />
  );
}
