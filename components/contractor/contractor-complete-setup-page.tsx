"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { finishContractorAccountSetup } from "@/lib/contractor/complete-signup";
import { readContractorProjectReturn } from "@/lib/contractor/contractor-project-onboarding";
import {
  clearShareLinkReturn,
  readShareLinkReturn,
} from "@/lib/contractor/share-link-onboarding";

export function ContractorCompleteSetupPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const result = await finishContractorAccountSetup(getToken);
        if (cancelled) return;

        const shareReturn = readShareLinkReturn();
        if (shareReturn?.startsWith("/review/")) {
          const token = shareReturn.replace("/review/", "");
          clearShareLinkReturn();

          const reviewResponse = await authenticatedFetch(
            getToken,
            `/api/review/${token}`
          );
          if (reviewResponse.ok) {
            const reviewData = (await reviewResponse.json()) as {
              can_edit?: boolean;
            };
            if (reviewData.can_edit) {
              router.replace(
                result.ready ? "/contractor" : "/contractor/onboarding"
              );
              router.refresh();
              return;
            }
          }

          await authenticatedFetch(getToken, `/api/review/${token}/claim`, {
            method: "POST",
          });
          window.location.assign(shareReturn);
          return;
        }

        const projectReturn = readContractorProjectReturn();
        router.replace(
          result.ready
            ? projectReturn ?? "/contractor"
            : "/contractor/onboarding"
        );
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
  }, [getToken, router]);

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
