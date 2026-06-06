import Link from "next/link";
import { ContractorSignupForm } from "@/components/marketing/contractor-signup-form";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent } from "@/components/ui/card";
import { marketingCopy } from "@/lib/marketing/copy";

export default function ContractorSignupPage() {
  const { signup } = marketingCopy;

  return (
    <MarketingShell>
      <MarketingPageHeader
        title={signup.contractor.title}
        subtitle={signup.contractor.subtitle}
        contentClassName="max-w-3xl"
        leading={
          <p className="text-sm text-[var(--muted)]">
            <Link
              href="/contractors"
              className="transition-colors hover:text-neutral-900"
            >
              ← Back to contractors
            </Link>
          </p>
        }
      />

      <div className="mx-auto max-w-3xl px-[var(--page-padding-x)] pb-16 md:pb-20">
        <Card>
          <CardContent className="p-6 md:p-8">
            <ContractorSignupForm />
          </CardContent>
        </Card>
      </div>
    </MarketingShell>
  );
}
