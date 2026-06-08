"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";
import { ContractorAccountCreateForm } from "@/components/review/contractor-account-create-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { persistContractorProjectReturn } from "@/lib/contractor/contractor-project-onboarding";

function contractorProjectReturnUrl(projectId: string) {
  return `/projects/${projectId}?claim=1&share=1`;
}

export function ContractorProjectAccountDialog({
  projectId,
  open,
  onOpenChange,
  onAccountReady,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountReady: () => void | Promise<void>;
}) {
  const { isSignedIn } = useAuth();
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(
    contractorProjectReturnUrl(projectId)
  )}`;

  useEffect(() => {
    if (!open) return;
    persistContractorProjectReturn(projectId);
  }, [open, projectId]);

  useEffect(() => {
    if (!open || !isSignedIn) return;

    let cancelled = false;
    setContinuing(true);
    setError(null);

    void (async () => {
      try {
        await onAccountReady();
        if (!cancelled) {
          onOpenChange(false);
        }
      } catch (continueError) {
        if (!cancelled) {
          setError(
            continueError instanceof Error
              ? continueError.message
              : "Could not continue to your project."
          );
        }
      } finally {
        if (!cancelled) {
          setContinuing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, onAccountReady, onOpenChange, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:space-y-4 sm:p-6">
        <div className="flex justify-center pt-1">
          <ScopeMateLogo className="h-7 text-neutral-900" />
        </div>

        {isSignedIn ? (
          <div className="space-y-3">
            <DialogHeader className="mb-0 text-center">
              <DialogTitle className="font-display text-lg font-normal tracking-tight text-balance sm:text-xl">
                Finish your contractor profile
              </DialogTitle>
              <DialogDescription className="text-[var(--muted)]">
                Save this client project to your contractor account so you can
                estimate and share it.
              </DialogDescription>
            </DialogHeader>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-[var(--muted)]">
              {continuing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Continuing...
                </>
              ) : (
                "Preparing your project..."
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <DialogHeader className="mb-0 text-center">
              <DialogTitle className="font-display text-lg font-normal tracking-tight text-balance sm:text-xl">
                Create a contractor account
              </DialogTitle>
              <DialogDescription className="text-[var(--muted)]">
                Save this client project so you can estimate, refine the scope,
                and share it with your client.
              </DialogDescription>
            </DialogHeader>

            <ContractorAccountCreateForm
              onComplete={() => {
                void onAccountReady();
              }}
            />

            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href={signInHref}>Sign in with existing account</Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
