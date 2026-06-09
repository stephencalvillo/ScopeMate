"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { ScopeBuddyLogo } from "@/components/layout/scopemate-logo";
import { ContractorAccountCreateForm } from "@/components/review/contractor-account-create-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatShareLinkHomeownerName } from "@/lib/contractor/display-homeowner";
import { persistContractorSignupPrefill } from "@/lib/contractor/signup-prefill";
import {
  clearShareLinkOnboardingDeferral,
  deferShareLinkOnboarding,
  isShareLinkOnboardingDeferred,
  persistShareLinkReturn,
} from "@/lib/contractor/share-link-onboarding";
import { SHARE_LINK_PLACEHOLDER_EMAIL } from "@/lib/contractor/project-share";
import type { ContractorInvitation } from "@/types";

function reviewSignupPrefill(invitation: ContractorInvitation) {
  const needsEmail = invitation.contractor_email === SHARE_LINK_PLACEHOLDER_EMAIL;

  return {
    email: needsEmail ? "" : invitation.contractor_email,
    contactName: invitation.contractor_name,
    companyName: invitation.contractor_company ?? "",
  };
}

export function ContractorShareLinkOnboardingDialog({
  open,
  onOpenChange,
  token,
  homeownerName,
  invitation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  homeownerName: string;
  invitation: ContractorInvitation;
}) {
  const { isSignedIn } = useAuth();
  const prefill = reviewSignupPrefill(invitation);
  const needsEmail = invitation.contractor_email === SHARE_LINK_PLACEHOLDER_EMAIL;
  const displayHomeownerName = formatShareLinkHomeownerName(homeownerName);
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(
    `/review/${token}?as=contractor`
  )}`;

  useEffect(() => {
    if (!open) return;
    persistShareLinkReturn(token);
    persistContractorSignupPrefill({
      email: prefill.email,
      contactName: prefill.contactName,
      companyName: prefill.companyName,
    });
  }, [open, prefill.companyName, prefill.contactName, prefill.email, token]);

  function handleDefer() {
    deferShareLinkOnboarding(token);
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isShareLinkOnboardingDeferred(token)) {
      deferShareLinkOnboarding(token);
    }
    onOpenChange(nextOpen);
  }

  function handleAccountComplete() {
    clearShareLinkOnboardingDeferral(token);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md space-y-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:space-y-4 sm:p-6">
        <div className="flex justify-center pt-1">
          <ScopeBuddyLogo className="h-7 text-neutral-900" />
        </div>

        {isSignedIn ? (
          <div className="space-y-3">
            <DialogHeader className="mb-0 text-center">
              <DialogTitle className="font-display text-lg font-normal tracking-tight text-balance break-words sm:text-xl">
                Finish your contractor profile
              </DialogTitle>
              <DialogDescription className="text-[var(--muted)]">
                {displayHomeownerName} shared a project with you. Add your
                business details to start estimating and manage all your projects
                in one place.
              </DialogDescription>
            </DialogHeader>
            <Button type="button" className="w-full" asChild>
              <Link href="/contractor/complete-setup">Continue setup</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleDefer}
            >
              I&apos;ll do this later
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <DialogHeader className="mb-0 text-center">
              <DialogTitle className="font-display text-lg font-normal tracking-tight text-balance break-words sm:text-xl">
                {displayHomeownerName} shared a project with you
              </DialogTitle>
              <DialogDescription className="text-[var(--muted)]">
                Create an account to view, estimate, and manage all your projects.
              </DialogDescription>
            </DialogHeader>

            <ContractorAccountCreateForm
              prefill={prefill}
              emailEditable={needsEmail}
              onComplete={handleAccountComplete}
            />

            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href={signInHref}>Sign in with existing account</Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleDefer}
            >
              I&apos;ll do this later
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
