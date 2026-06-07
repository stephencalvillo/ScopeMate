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
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="font-display text-2xl text-neutral-900">{title}</h2>
          {description ? (
            <p className="text-sm text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
        {action ? (
          <div className="flex max-w-full shrink-0 items-center overflow-x-auto">
            {action}
          </div>
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
        "rounded-[8px] border border-[var(--border)] bg-white p-[var(--surface-padding)]",
        className
      )}
    >
      {children}
    </div>
  );
}
