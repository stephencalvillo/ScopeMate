import { Loader2 } from "lucide-react";
import { GridBackground } from "@/components/marketing/grid-background";

export function GridLoadingCard({
  title,
  helperText,
  steps,
  stepIndex = 0,
}: {
  title: string;
  helperText?: string;
  steps?: readonly string[];
  stepIndex?: number;
}) {
  return (
    <div className="relative min-h-[22rem] overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--background)]">
      <GridBackground />
      <div className="relative z-10 flex min-h-[22rem] flex-col items-center justify-center px-8 py-16 text-center">
        <Loader2
          className="mb-6 h-10 w-10 animate-spin text-neutral-900"
          aria-hidden
        />
        <p className="font-display text-2xl tracking-tight text-balance text-neutral-900">
          {title}
        </p>
        {helperText ? (
          <p className="mt-3 max-w-md text-sm text-[var(--muted)]">{helperText}</p>
        ) : null}
        {steps && steps.length > 0 ? (
          <div className="mt-8 flex gap-2" aria-hidden>
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  index <= stepIndex ? "bg-neutral-900" : "bg-neutral-200"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
