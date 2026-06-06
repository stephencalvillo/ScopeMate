import { Check } from "lucide-react";
import { SectionSurface } from "@/components/layout/page-section";
import { cn } from "@/lib/utils";

export function FollowUpScopeAddedConfirmation({
  exiting = false,
}: {
  exiting?: boolean;
}) {
  return (
    <SectionSurface
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        exiting ? "scope-added-exit" : "scope-added-enter"
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <Check className="h-6 w-6" strokeWidth={2.5} />
      </div>
      <p className="max-w-sm text-sm font-medium leading-6 text-neutral-900">
        Your response has been added to the scope above
      </p>
    </SectionSurface>
  );
}
