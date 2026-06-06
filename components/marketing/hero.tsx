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
  compact?: boolean;
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
  compact = false,
  children,
  className,
}: HeroProps) {
  const isCentered = align === "center";

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        gridBackground
          ? compact
            ? "pb-[0.6rem] pt-[3.45rem] md:pb-[1.15rem] md:pt-[4.6rem]"
            : "pb-[5.75rem] pt-[4.6rem] md:pb-[8.05rem] md:pt-[6.9rem]"
          : compact
            ? "py-[2.875rem] md:py-[4.025rem]"
            : "py-[4.6rem] md:py-[6.9rem]",
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
            compact ? "space-y-4" : "space-y-6",
            isCentered ? "mx-auto w-full max-w-4xl" : "max-w-2xl"
          )}
        >
        <h1
          className={cn(
            "font-display tracking-tight text-neutral-900 text-balance",
            compact
              ? "text-3xl leading-tight md:text-4xl"
              : "text-4xl md:text-5xl md:leading-tight",
            isCentered && "mx-auto max-w-3xl"
          )}
        >
          {headline}
        </h1>
        {subheadline ? (
          <p
            className={cn(
              compact
                ? "text-base leading-relaxed text-[var(--muted)] text-balance md:text-lg"
                : "text-lg leading-relaxed text-[var(--muted)] text-balance md:text-xl",
              isCentered && "mx-auto w-full max-w-4xl"
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
