import { redirect } from "next/navigation";
import { ContractorBusinessInfoForm } from "@/components/contractor/contractor-business-info-form";
import { MyProjectsBreadcrumb } from "@/components/layout/my-projects-breadcrumb";
import { PageBreadcrumbHeader } from "@/components/layout/page-breadcrumb-header";
import { Card, CardContent } from "@/components/ui/card";
import { ensureUserRecord } from "@/lib/auth/clerk";
import {
  completeContractorSetupIfReady,
  getContractorProfile,
} from "@/lib/contractor/profile";

export default async function ContractorBusinessInfoPage() {
  const user = await ensureUserRecord();
  const { ready, profile } = await completeContractorSetupIfReady(user);

  if (!ready) {
    redirect("/contractor/onboarding");
  }

  const contractorProfile = profile ?? (await getContractorProfile(user.id));

  if (!contractorProfile) {
    redirect("/contractor/onboarding");
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <PageBreadcrumbHeader breadcrumb={<MyProjectsBreadcrumb href="/contractor" />}>
        <div className="space-y-2">
          <h1 className="font-display text-3xl tracking-tight text-neutral-900">
            Business info
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Update how your business appears to homeowners and keep your service
            area current for future project matching.
          </p>
        </div>
      </PageBreadcrumbHeader>

      <Card>
        <CardContent className="p-6 md:p-8">
          <ContractorBusinessInfoForm
            defaultCompanyName={contractorProfile.company_name}
            defaultContactName={contractorProfile.contact_name}
            defaultServiceArea={contractorProfile.service_area ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
