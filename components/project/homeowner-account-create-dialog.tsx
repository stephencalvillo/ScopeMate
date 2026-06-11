"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { ScopeBuddyLogo } from "@/components/layout/scopemate-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { persistGuestProjectToken } from "@/lib/auth/guest-project-session";
import {
  buildShareClaimReturnUrl,
  persistSignupShareIntent,
} from "@/lib/project/share-return-onboarding";

export function HomeownerAccountCreateDialog({
  projectId,
  open,
  onOpenChange,
  onAccountReady,
  shareOnComplete = true,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountReady: () => void | Promise<void>;
  shareOnComplete?: boolean;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returnUrl, setReturnUrl] = useState(() =>
    buildShareClaimReturnUrl(projectId)
  );
  const [returnUrlReady, setReturnUrlReady] = useState(false);
  const signUpHref = `/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`;
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`;

  useEffect(() => {
    if (!open) return;
    if (shareOnComplete) {
      persistSignupShareIntent(projectId);
    }

    void (async () => {
      const response = await fetch(`/api/projects/${projectId}/guest-token`);
      if (!response.ok) {
        setReturnUrlReady(true);
        return;
      }

      const data = await response.json();
      if (typeof data.guest_access_token === "string") {
        persistGuestProjectToken(projectId, data.guest_access_token);
      }
      setReturnUrlReady(true);
    })();
  }, [open, projectId, shareOnComplete]);

  useEffect(() => {
    if (!open || !isLoaded || !isSignedIn) return;

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
              : shareOnComplete
                ? "Could not continue to share link."
                : "Could not save this project."
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
  }, [isLoaded, isSignedIn, onAccountReady, onOpenChange, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="mb-4 flex justify-center">
          <ScopeBuddyLogo className="h-7 text-neutral-900" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-xl font-normal tracking-tight text-balance">
            Finish creating your account
          </DialogTitle>
          <DialogDescription className="text-[var(--muted)]">
            Share and manage your projects with multiple contractors.
          </DialogDescription>
        </DialogHeader>

        {isSignedIn ? (
          <>
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            <div className="mt-4 flex items-center justify-center gap-2 py-2 text-sm text-[var(--muted)]">
              {continuing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Continuing...
                </>
              ) : shareOnComplete ? (
                "Preparing your share link..."
              ) : (
                "Saving your project..."
              )}
            </div>
          </>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {returnUrlReady ? (
              <Button type="button" className="w-full" asChild>
                <Link href={signUpHref}>Sign up</Link>
              </Button>
            ) : (
              <Button type="button" className="w-full" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing sign up…
              </Button>
            )}
            {returnUrlReady ? (
              <Button type="button" variant="outline" className="w-full" asChild>
                <Link href={signInHref}>Sign in with existing account</Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" className="w-full" disabled>
                Preparing sign in…
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
