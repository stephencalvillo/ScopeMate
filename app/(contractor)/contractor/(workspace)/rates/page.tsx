import { redirect } from "next/navigation";
import { ContractorRatesPage } from "@/components/contractor/contractor-rates-page";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { completeContractorSetupIfReady } from "@/lib/contractor/profile";

export default async function ContractorRatesRoutePage() {
  const user = await ensureUserRecord();
  const { profile, ready } = await completeContractorSetupIfReady(user);

  if (!ready || !profile) {
    redirect("/contractor/onboarding");
  }

  return <ContractorRatesPage />;
}
