import { HomeownerDescribeForm } from "@/components/marketing/homeowner-describe-form";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";
import { marketingCopy } from "@/lib/marketing/copy";

export default function HomeownerSignupPage() {
  const { signup } = marketingCopy;

  return (
    <MarketingShell>
      <MarketingPageHeader
        title={signup.homeowner.title}
        subtitle={signup.homeowner.subtitle}
        contentClassName="max-w-2xl"
        className="pb-6 pt-16 md:pb-6 md:pt-20"
      />

      <div className="mx-auto max-w-2xl px-[var(--page-padding-x)] pb-16 md:pb-20">
        <Card>
          <CardContent className="p-6 md:p-8">
            <HomeownerDescribeForm />
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
