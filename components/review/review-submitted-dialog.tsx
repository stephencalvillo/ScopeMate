"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";
import { ContractorAccountCreateForm } from "@/components/review/contractor-account-create-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { persistContractorSignupPrefill } from "@/lib/contractor/signup-prefill";
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

export function ReviewSubmittedDialog({
  open,
  onOpenChange,
  invitation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: ContractorInvitation;
}) {
  const { isSignedIn } = useAuth();
  const prefill = reviewSignupPrefill(invitation);
  const needsEmail = invitation.contractor_email === SHARE_LINK_PLACEHOLDER_EMAIL;
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent("/contractor/complete-setup")}`;

  useEffect(() => {
    if (!open) return;

    persistContractorSignupPrefill({
      email: prefill.email,
      contactName: prefill.contactName,
      companyName: prefill.companyName,
    });
  }, [open, prefill.companyName, prefill.contactName, prefill.email]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="mb-4 flex justify-center">
          <ScopeMateLogo className="h-7 text-neutral-900" />
        </div>

        {isSignedIn ? (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="font-display text-xl font-normal tracking-tight text-balance">
                Review submitted
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-[var(--muted)]">
              The homeowner can now see your scope feedback, notes, and proposal
              range. Add a contractor profile to this account to track this review
              and switch between homeowner and contractor views anytime.
            </p>
            <Button type="button" className="w-full" asChild>
              <Link href="/contractor/complete-setup">Go to your reviews</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </>
        ) : (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="font-display text-xl font-normal tracking-tight text-balance">
                Save this review to your account
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-[var(--muted)]">
              Already use ScopeMate as a homeowner? Sign in with the same email to
              add a contractor profile. New here? Create an account below.
            </p>

            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href={signInHref}>Sign in with existing account</Link>
            </Button>

            <ContractorAccountCreateForm
              prefill={prefill}
              emailEditable={needsEmail}
              onComplete={() => onOpenChange(false)}
            />

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Continue without account
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href="/contractors">Learn more about ScopeMate</Link>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
