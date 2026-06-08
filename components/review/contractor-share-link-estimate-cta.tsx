"use client";

import { Button } from "@/components/ui/button";
import { SectionSurface } from "@/components/layout/page-section";

export function ContractorShareLinkEstimateCta({
  onCreateAccount,
}: {
  onCreateAccount: () => void;
}) {
  return (
    <SectionSurface className="space-y-4 border-amber-200 bg-amber-50/80 p-4 sm:p-5">
      <div className="space-y-1.5">
        <h2 className="font-display text-lg tracking-tight text-balance text-neutral-900 sm:text-xl">
          Ready to price this project?
        </h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Create a free contractor account to build your estimate, add scope
          feedback, and manage every project in one place.
        </p>
      </div>
      <Button
        type="button"
        className="h-11 w-full sm:h-10 sm:w-auto"
        onClick={onCreateAccount}
      >
        Create project estimate
      </Button>
    </SectionSurface>
  );
}
