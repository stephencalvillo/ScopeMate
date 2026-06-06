import { cn } from "@/lib/utils";

export function PreviewSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-neutral-900">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      <div
        className={cn(
          "rounded-[4px] border border-[var(--border)] bg-white p-6",
          className
        )}
      >
        {children}
      </div>
    </section>
  );
}
