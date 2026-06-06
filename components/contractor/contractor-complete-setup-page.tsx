"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { finishContractorAccountSetup } from "@/lib/contractor/complete-signup";

export function ContractorCompleteSetupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const result = await finishContractorAccountSetup();
        if (cancelled) return;

        router.replace(result.ready ? "/contractor" : "/contractor/onboarding");
        router.refresh();
      } catch (setupError) {
        if (cancelled) return;
        setError(
          setupError instanceof Error
            ? setupError.message
            : "Could not finish contractor setup."
        );
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-3 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          className="text-sm font-medium text-neutral-900 underline"
          onClick={() => router.replace("/contractor/onboarding")}
        >
          Continue to profile setup
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--muted)]">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      Setting up your contractor account
    </div>
  );
}
