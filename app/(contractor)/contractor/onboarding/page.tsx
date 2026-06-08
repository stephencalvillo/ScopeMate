import { redirect } from "next/navigation";
import { ContractorOnboardingForm } from "@/components/contractor/contractor-onboarding-form";
import { Card, CardContent } from "@/components/ui/card";
import { ensureUserRecord } from "@/lib/auth/clerk";
import {
  completeContractorSetupIfReady,
  getContractorProfile,
} from "@/lib/contractor/profile";

export default async function ContractorOnboardingPage() {
  const user = await ensureUserRecord();
  const { ready, profile } = await completeContractorSetupIfReady(user);

  if (ready) {
    redirect("/contractor");
  }

  const existingProfile = profile ?? (await getContractorProfile(user.id));

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl tracking-tight text-balance text-neutral-900 sm:text-4xl">
          Set up your contractor profile
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Confirm your business details so ScopeMate can link your past and
          future project reviews. You can switch back to homeowner projects
          anytime from the account menu.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <ContractorOnboardingForm
            defaultCompanyName={existingProfile?.company_name ?? ""}
            defaultContactName={existingProfile?.contact_name ?? user.name ?? ""}
            defaultServiceArea={existingProfile?.service_area ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
