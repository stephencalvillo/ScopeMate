import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CTAButton } from "@/components/marketing/cta-button";
import { HowItWorksScrollSection } from "@/components/marketing/how-it-works-scroll-section";
import { Hero } from "@/components/marketing/hero";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PathCard } from "@/components/marketing/path-card";
import { marketingCopy } from "@/lib/marketing/copy";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/projects");
  }

  const { homepage } = marketingCopy;

  return (
    <MarketingShell>
      <Hero
        gridBackground
        compact
        headline={homepage.hero.headline}
        subheadline={homepage.hero.subheadline}
        primaryCta={{
          label: homepage.hero.primaryCta,
          href: "/homeowners/signup",
        }}
        secondaryCta={{
          label: homepage.hero.secondaryCta,
          href: "/contractors",
        }}
      />

      <HowItWorksScrollSection
        title={homepage.howItWorks.title}
        steps={homepage.howItWorks.steps}
      />

      <MarketingSection
        title={homepage.choosePath.title}
        className="bg-white pt-0"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <PathCard
            audience="homeowners"
            headline={homepage.choosePath.homeowners.headline}
            description={homepage.choosePath.homeowners.description}
            cta={homepage.choosePath.homeowners.cta}
            href="/homeowners/signup"
          />
          <PathCard
            audience="contractors"
            headline={homepage.choosePath.contractors.headline}
            description={homepage.choosePath.contractors.description}
            cta={homepage.choosePath.contractors.cta}
            href="/contractors/signup"
          />
        </div>
      </MarketingSection>

      <MarketingSection className="bg-white">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="font-display text-3xl tracking-tight text-neutral-900 text-balance">
              {homepage.finalCta.headline}
            </h2>
            <p className="text-base text-[var(--muted)] md:text-lg">
              {homepage.finalCta.subheadline}
            </p>
          </div>
          <CTAButton href="/homeowners/signup" size="lg">
            {homepage.finalCta.cta}
          </CTAButton>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
