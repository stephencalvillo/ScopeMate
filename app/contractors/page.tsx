import { CTAButton } from "@/components/marketing/cta-button";
import { FeatureCard } from "@/components/marketing/feature-card";
import { Hero } from "@/components/marketing/hero";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { marketingCopy } from "@/lib/marketing/copy";

export default function ContractorsPage() {
  const { contractors } = marketingCopy;

  return (
    <MarketingShell>
      <Hero
        gridBackground
        align="left"
        headline={contractors.hero.headline}
        subheadline={contractors.hero.subheadline}
        primaryCta={{
          label: contractors.hero.cta,
          href: "/contractors/signup",
        }}
      />

      <MarketingSection title="Built for contractors who value clarity">
        <div className="grid gap-6 sm:grid-cols-2">
          {contractors.benefits.map((benefit) => (
            <FeatureCard
              key={benefit.title}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="bg-white">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="font-display text-2xl tracking-tight text-neutral-900 text-balance">
            Homeowners don&apos;t know what to ask. Contractors don&apos;t know
            what&apos;s missing. ScopeMate bridges the gap.
          </p>
          <p className="text-base text-[var(--muted)]">
            Join ScopeMate to receive better-prepared project scopes and spend
            more time on work that wins jobs.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection bottomGlow className="bg-[var(--accent)]/30">
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <h2 className="font-display text-3xl tracking-tight text-neutral-900 text-balance">
            Start receiving clearer project scopes today
          </h2>
          <CTAButton href="/contractors/signup" size="lg">
            {contractors.hero.cta}
          </CTAButton>
        </div>
      </MarketingSection>
    </MarketingShell>
  );
}
