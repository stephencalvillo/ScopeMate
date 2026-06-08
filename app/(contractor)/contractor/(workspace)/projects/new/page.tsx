import { redirect } from "next/navigation";
import { ContractorClientProjectForm } from "@/components/marketing/contractor-client-project-form";
import { Card, CardContent } from "@/components/ui/card";
import { ensureUserRecord } from "@/lib/auth/clerk";
import {
  completeContractorSetupIfReady,
} from "@/lib/contractor/profile";
import { marketingCopy } from "@/lib/marketing/copy";

export default async function ContractorNewClientProjectPage() {
  const user = await ensureUserRecord();
  const { ready } = await completeContractorSetupIfReady(user);

  if (!ready) {
    redirect("/contractor/onboarding");
  }

  const { getStartedContractor } = marketingCopy.signup;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl tracking-tight text-balance text-neutral-900 sm:text-4xl">
          {getStartedContractor.title}
        </h1>
        <p className="text-sm text-[var(--muted)] sm:text-base">
          {getStartedContractor.subtitle}
        </p>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <ContractorClientProjectForm mode="portal" />
        </CardContent>
      </Card>
    </div>
  );
}
