import { GetStartedSignup } from "@/components/marketing/get-started-signup";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";
export default function HomeownerSignupPage() {
  return (
    <MarketingShell>
      <MarketingPageHeader
        title="Get started"
        subtitle="Choose whether you're planning your own project or scoping work for a client."
        contentClassName="max-w-2xl"
        className="pb-6 pt-16 md:pb-6 md:pt-20"
      />

      <div className="mx-auto max-w-2xl px-[var(--page-padding-x)] pb-16 md:pb-20">
        <Card>
          <CardContent className="p-6 md:p-8">
            <GetStartedSignup />
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
