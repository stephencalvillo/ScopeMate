"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";
import { HomeownerAccountCreateForm } from "@/components/project/homeowner-account-create-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function HomeownerAccountCreateDialog({
  projectId,
  open,
  onOpenChange,
  onAccountReady,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountReady: () => void;
}) {
  const { isSignedIn } = useAuth();
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(
    `/projects/${projectId}?claim=1`
  )}`;

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
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              onAccountReady();
              onOpenChange(false);
            }}
          >
            Continue to share link
          </Button>
        ) : (
          <>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href={signInHref}>Sign in with existing account</Link>
            </Button>

            <HomeownerAccountCreateForm
              projectId={projectId}
              onComplete={() => {
                onAccountReady();
                onOpenChange(false);
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
