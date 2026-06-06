import { cn } from "@/lib/utils";
import { GridBackground } from "@/components/marketing/grid-background";

type MarketingPageHeaderProps = {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function MarketingPageHeader({
  title,
  subtitle,
  leading,
  className,
  contentClassName,
}: MarketingPageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden pb-12 pt-16 md:pb-16 md:pt-20",
        className
      )}
    >
      <GridBackground />
      <div
        className={cn(
          "relative z-10 mx-auto px-[var(--page-padding-x)]",
          contentClassName
        )}
      >
        <div className="space-y-3">
          {leading}
          <h1 className="font-display text-4xl tracking-tight text-neutral-900 text-balance">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-base text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
