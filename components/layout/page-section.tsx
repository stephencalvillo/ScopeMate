import { cn } from "@/lib/utils";

export function PageSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="font-display text-2xl text-neutral-900">{title}</h2>
          {description ? (
            <p className="text-sm text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
        {action ? (
          <div className="flex shrink-0 items-center">{action}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function SectionSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-[var(--border)] bg-white p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
