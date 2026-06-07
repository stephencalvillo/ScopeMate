"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "scopemate-disclaimer-dismissed";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  if (dismissed !== false) {
    return null;
  }

  return (
    <div className="border-b border-[var(--border)] bg-[var(--accent)]/40 px-[var(--page-padding-x)] py-2.5 text-sm text-[var(--accent-foreground)]">
      <div className="flex items-center">
        <div className="flex-1" aria-hidden />
        <p className="text-center">
          ScopeMate is a planning tool. It does not provide engineering,
          architectural, permit, or final pricing advice. Contractors are
          responsible for verifying scope and pricing.
        </p>
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss disclaimer"
            className="shrink-0 rounded-md p-1 text-[var(--accent-foreground)]/70 transition-colors hover:bg-black/5 hover:text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
