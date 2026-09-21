import { GetStartedSignup } from "@/components/marketing/get-started-signup";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function HomeownerSignupPage() {
  return (
    <MarketingShell>
      <MarketingPageHeader
        title="Get started"
        contentClassName="max-w-2xl"
        className="pb-4 pt-16 md:pb-4 md:pt-20"
      />

      <div className="mx-auto max-w-2xl px-[var(--page-padding-x)] pb-16 md:pb-20">
        <GetStartedSignup />
      </div>
    </MarketingShell>
  );
}
