import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProcessVisualProps = {
  steps: readonly string[];
  className?: string;
};

export function ProcessVisual({ steps, className }: ProcessVisualProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-center",
        className
      )}
    >
      {steps.map((step, index) => (
        <div
          key={step}
          className="flex flex-col items-center gap-4 md:flex-row"
        >
          <Card className="w-full min-w-0 flex-1 px-6 py-5 text-center md:min-w-[180px]">
            <p className="font-display text-base text-neutral-900">{step}</p>
          </Card>
          {index < steps.length - 1 ? (
            <ArrowRight
              className="hidden h-5 w-5 shrink-0 text-[var(--muted)] md:block"
              aria-hidden
            />
          ) : null}
          {index < steps.length - 1 ? (
            <div className="h-4 w-px bg-[var(--border)] md:hidden" aria-hidden />
          ) : null}
        </div>
      ))}
    </div>
  );
}
