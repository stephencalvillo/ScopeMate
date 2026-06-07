"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getClerkAppearance } from "@/lib/clerk/appearance";

type AuthStep = "intro" | "sign-up" | "sign-in";

function projectReturnUrl(projectId: string) {
  return `/projects/${projectId}?claim=1&share=1`;
}

export function HomeownerAccountCreateDialog({
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
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const clerkContainerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<AuthStep>("intro");
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const returnUrl = projectReturnUrl(projectId);
  const clerkAppearance = useMemo(() => {
    const base = getClerkAppearance();
    return {
      ...base,
      elements: {
        ...base.elements,
        modalBackdrop: "hidden",
        modalContent:
          "shadow-none max-w-none w-full mx-0 my-0 rounded-none border-0 bg-transparent",
      },
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setStep("intro");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || step === "intro" || isSignedIn || !clerk.loaded) {
      return;
    }

    const modalProps = {
      appearance: clerkAppearance,
      forceRedirectUrl: returnUrl,
      fallbackRedirectUrl: returnUrl,
      getContainer: () => clerkContainerRef.current,
    };

    if (step === "sign-up") {
      clerk.openSignUp(modalProps);
    } else {
      clerk.openSignIn(modalProps);
    }

    return () => {
      clerk.closeSignUp();
      clerk.closeSignIn();
    };
  }, [clerk, clerkAppearance, clerk.loaded, isSignedIn, open, returnUrl, step]);

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
              : "Could not continue to share link."
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

  const showingClerk = step === "sign-up" || step === "sign-in";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={showingClerk ? "max-w-lg gap-0 p-0" : "max-w-md"}
      >
        {showingClerk ? (
          <div className="border-b border-stone-200 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 px-2 text-[var(--muted)]"
              onClick={() => setStep("intro")}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </div>
        ) : null}

        <div className={showingClerk ? "px-2 pb-4 pt-1" : undefined}>
          {step === "intro" ? (
            <>
              <div className="mb-4 flex justify-center">
                <ScopeMateLogo className="h-7 text-neutral-900" />
              </div>

              <DialogHeader className="text-center">
                <DialogTitle className="font-display text-xl font-normal tracking-tight text-balance">
                  Finish creating your account
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-[var(--muted)]">
                Share and manage your projects with multiple contractors.
              </p>

              {isSignedIn ? (
                <>
                  {error ? (
                    <p className="mt-4 text-sm text-red-600">{error}</p>
                  ) : null}
                  <div className="mt-4 flex items-center justify-center gap-2 py-2 text-sm text-[var(--muted)]">
                    {continuing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Continuing...
                      </>
                    ) : (
                      "Preparing your share link..."
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setStep("sign-up")}
                  >
                    Sign up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep("sign-in")}
                  >
                    Sign in with existing account
                  </Button>
                </div>
              )}
            </>
          ) : null}

          {showingClerk ? (
            <div ref={clerkContainerRef} className="min-h-[28rem]" />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
