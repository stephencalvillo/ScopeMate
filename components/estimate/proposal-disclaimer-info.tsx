"use client";

import { Info } from "lucide-react";
import { PROPOSAL_DISCLAIMER } from "@/lib/estimates/money";

export function ProposalDisclaimerInfo() {
  return (
    <span className="group/info relative inline-flex shrink-0">
      <button
        type="button"
        className="inline-flex rounded-sm text-[var(--muted)] transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
        aria-label={PROPOSAL_DISCLAIMER}
      >
        <Info className="h-4 w-4" aria-hidden />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-left text-xs leading-relaxed text-neutral-800 opacity-0 shadow-sm transition-opacity group-hover/info:opacity-100 group-focus-within/info:opacity-100"
      >
        {PROPOSAL_DISCLAIMER}
      </span>
    </span>
  );
}
