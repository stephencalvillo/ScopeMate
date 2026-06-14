import { cn } from "@/lib/utils";
import { GridBackground } from "@/components/marketing/grid-background";

type MarketingSectionProps = {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
  gridBackground?: boolean;
  bottomGlow?: boolean;
  id?: string;
};

export function MarketingSection({
  title,
  description,
  children,
  className,
  centered = false,
  gridBackground = false,
  bottomGlow = false,
  id,
}: MarketingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-16 md:py-20",
        (gridBackground || bottomGlow) && "overflow-hidden",
        className
      )}
    >
      {gridBackground ? <GridBackground /> : null}
      {bottomGlow ? (
        <div
          className="marketing-section-bottom-glow pointer-events-none absolute inset-0"
          aria-hidden
        />
      ) : null}
      <div className="relative z-10 mx-auto max-w-6xl px-[var(--page-padding-x)]">
        {(title || description) && (
          <div
            className={cn(
              "mb-10 space-y-3 text-center",
              centered && "mx-auto max-w-2xl"
            )}
          >
            {title ? (
              <h2 className="font-display text-3xl tracking-tight text-neutral-900 text-balance">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                className={cn(
                  "text-base text-[var(--muted)]",
                  centered && "mx-auto max-w-2xl"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
