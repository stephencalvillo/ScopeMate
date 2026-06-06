import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/marketing/cta-button";
import { GridBackground } from "@/components/marketing/grid-background";

type HeroProps = {
  headline: string;
  subheadline?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  align?: "center" | "left";
  gridBackground?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export function Hero({
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  align = "center",
  gridBackground = false,
  children,
  className,
}: HeroProps) {
  const isCentered = align === "center";

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        gridBackground ? "pb-20 pt-16 md:pb-28 md:pt-24" : "py-16 md:py-24",
        isCentered && "text-center",
        className
      )}
    >
      {gridBackground ? <GridBackground /> : null}
      <div
        className={cn(
          "relative z-10 mx-auto space-y-6",
          gridBackground
            ? "max-w-6xl px-[var(--page-padding-x)]"
            : "max-w-3xl",
          !isCentered && !gridBackground && "max-w-2xl"
        )}
      >
        <div
          className={cn(
            "space-y-6",
            isCentered ? "mx-auto max-w-3xl" : "max-w-2xl"
          )}
        >
        <h1 className="font-display text-4xl tracking-tight text-neutral-900 text-balance md:text-5xl md:leading-tight">
          {headline}
        </h1>
        {subheadline ? (
          <p
            className={cn(
              "text-lg leading-relaxed text-[var(--muted)] text-balance md:text-xl",
              isCentered && "mx-auto max-w-2xl"
            )}
          >
            {subheadline}
          </p>
        ) : null}
        {(primaryCta || secondaryCta) && (
          <div
            className={cn(
              "flex flex-col gap-3 pt-2 sm:flex-row sm:items-center",
              isCentered && "sm:justify-center"
            )}
          >
            {primaryCta ? (
              <CTAButton href={primaryCta.href} size="lg">
                {primaryCta.label}
              </CTAButton>
            ) : null}
            {secondaryCta ? (
              <CTAButton href={secondaryCta.href} variant="secondary" size="lg">
                {secondaryCta.label}
              </CTAButton>
            ) : null}
          </div>
        )}
        {children}
        </div>
      </div>
    </section>
  );
}
