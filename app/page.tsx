import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HowItWorksScrollSection } from "@/components/marketing/how-it-works-scroll-section";
import { Hero } from "@/components/marketing/hero";
import { HeroProductPreview } from "@/components/marketing/hero-product-preview";
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
        viewport
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
      >
        <HeroProductPreview />
      </Hero>

      <HowItWorksScrollSection
        title={homepage.howItWorks.title}
        steps={homepage.howItWorks.steps}
      />

      <MarketingSection
        title={homepage.choosePath.title}
        description={
          <>
            {homepage.choosePath.descriptionLead}
            <br className="hidden md:block" />
            {homepage.choosePath.descriptionClosing}
          </>
        }
        centered
        className="bg-white pt-12 md:pt-[100px]"
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
    </MarketingShell>
  );
}
