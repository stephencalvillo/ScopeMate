"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";
import { HomeownerAccountCreateForm } from "@/components/project/homeowner-account-create-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const { isSignedIn } = useAuth();
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const returnUrl = projectReturnUrl(projectId);
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="mb-4 flex justify-center">
          <ScopeMateLogo className="h-7 text-neutral-900" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-xl font-normal tracking-tight text-balance">
            Create your account
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[var(--muted)]">
          Share and manage your projects with multiple contractors.
        </p>

        {isSignedIn ? (
          <>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button
              type="button"
              className="w-full"
              disabled={continuing}
              onClick={() => {
                setContinuing(true);
                setError(null);
                void (async () => {
                  try {
                    await onAccountReady();
                    onOpenChange(false);
                  } catch (continueError) {
                    setError(
                      continueError instanceof Error
                        ? continueError.message
                        : "Could not continue to share link."
                    );
                  } finally {
                    setContinuing(false);
                  }
                })();
              }}
            >
              {continuing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Continuing...
                </>
              ) : (
                "Continue to share link"
              )}
            </Button>
          </>
        ) : (
          <>
            <HomeownerAccountCreateForm returnUrl={returnUrl} />
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full"
              asChild
            >
              <Link href={signInHref}>Sign in with existing account</Link>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
