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
          Create account to review and submit project estimate
        </h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Review the scope below, then create a free contractor account when
          you&apos;re ready to build your estimate and submit a proposal.
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
