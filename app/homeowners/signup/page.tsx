import { HomeownerSignupForm } from "@/components/marketing/homeowner-signup-form";
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
      />

      <div className="mx-auto max-w-2xl px-[var(--page-padding-x)] pb-16 md:pb-20">
        <Card>
          <CardContent className="p-6 md:p-8">
            <HomeownerSignupForm />
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
