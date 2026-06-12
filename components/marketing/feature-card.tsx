import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: "card" | "plain";
};

function FeatureCardContent({
  title,
  description,
  icon,
}: Pick<FeatureCardProps, "title" | "description" | "icon">) {
  return (
    <>
      {icon ? (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
          {icon}
        </span>
      ) : null}
      <h3 className="font-display text-lg text-neutral-900">{title}</h3>
      <p className="text-base leading-relaxed text-[var(--muted)]">
        {description}
      </p>
    </>
  );
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  variant = "card",
}: FeatureCardProps) {
  if (variant === "plain") {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        {icon ? (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="font-display text-lg text-neutral-900">{title}</h3>
          <p className="text-lg leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="space-y-3 p-[var(--card-padding)]">
        <FeatureCardContent title={title} description={description} icon={icon} />
      </CardContent>
    </Card>
  );
}
