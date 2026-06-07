import { Card, CardContent } from "@/components/ui/card";
import { CTAButton } from "@/components/marketing/cta-button";
import { cn } from "@/lib/utils";

type PathCardProps = {
  audience: "homeowners" | "contractors";
  headline: string;
  description: string;
  cta: string;
  href: string;
  className?: string;
};

export function PathCard({
  audience,
  headline,
  description,
  cta,
  href,
  className,
}: PathCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden",
        audience === "homeowners" && "border-neutral-200",
        audience === "contractors" && "border-neutral-300",
        className
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wider text-[var(--muted)]">
            {audience === "homeowners" ? "For homeowners" : "For contractors"}
          </p>
          <h3 className="font-display text-2xl tracking-tight text-neutral-900 text-balance">
            {headline}
          </h3>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        </div>
        <div className="mt-auto">
          <CTAButton
            href={href}
            variant={audience === "contractors" ? "secondary" : "default"}
            className="w-full sm:w-auto"
          >
            {cta}
          </CTAButton>
        </div>
      </CardContent>
    </Card>
  );
}
