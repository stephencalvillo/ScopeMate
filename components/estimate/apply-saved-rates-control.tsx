"use client";

import Link from "next/link";
import { useContractorEstimate } from "@/components/estimate/contractor-estimate-context";
import { Button } from "@/components/ui/button";

export function ApplySavedRatesControl() {
  const { showEstimate, canEdit, saving, generating, applySavedRates } =
    useContractorEstimate();

  if (!showEstimate || !canEdit) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={saving || generating}
        onClick={() => void applySavedRates()}
      >
        Apply my rates
      </Button>
      <Link
        href="/contractor/rates"
        className="text-sm text-[var(--muted)] transition-colors hover:text-neutral-900"
      >
        Manage rates
      </Link>
    </div>
  );
}
