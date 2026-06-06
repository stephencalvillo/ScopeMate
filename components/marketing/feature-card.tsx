import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
};

export function FeatureCard({
  title,
  description,
  icon,
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="space-y-3 p-[var(--card-padding)]">
        {icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
            {icon}
          </span>
        ) : null}
        <h3 className="font-display text-lg text-neutral-900">{title}</h3>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
