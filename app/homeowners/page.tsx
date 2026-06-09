import { CTAButton } from "@/components/marketing/cta-button";
import { FeatureCard } from "@/components/marketing/feature-card";
import { Hero } from "@/components/marketing/hero";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ProcessVisual } from "@/components/marketing/process-visual";
import { marketingCopy } from "@/lib/marketing/copy";

export default function HomeownersPage() {
  const { homeowners } = marketingCopy;

  return (
    <MarketingShell>
      <Hero
        gridBackground
        headline={homeowners.hero.headline}
        subheadline={homeowners.hero.subheadline}
        primaryCta={{
          label: homeowners.hero.cta,
          href: "/homeowners/signup",
        }}
      />

      <MarketingSection title="How ScopeBuddy helps homeowners">
        <div className="grid gap-6 sm:grid-cols-2">
          {homeowners.benefits.map((benefit) => (
            <FeatureCard
              key={benefit.title}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        title="From idea to scope"
        description="ScopeBuddy guides you through the details contractors need to price your project accurately."
        className="bg-white"
        centered
      >
        <ProcessVisual steps={homeowners.process.steps} />
      </MarketingSection>

      <MarketingSection bottomGlow className="bg-[var(--accent)]/30">
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <h2 className="font-display text-3xl tracking-tight text-neutral-900 text-balance">
            Ready to plan your project with confidence?
          </h2>
          <CTAButton href="/homeowners/signup" size="lg">
            {homeowners.hero.cta}
          </CTAButton>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
