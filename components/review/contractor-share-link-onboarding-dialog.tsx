"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ScopeBuddyLogo } from "@/components/layout/scopemate-logo";
import { ContractorAccountCreateForm } from "@/components/review/contractor-account-create-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatShareLinkHomeownerName } from "@/lib/contractor/display-homeowner";
import {
  readContractorSignupPrefill,
  persistContractorSignupPrefill,
} from "@/lib/contractor/signup-prefill";
import {
  clearShareLinkOnboardingDeferral,
  deferShareLinkOnboarding,
  isShareLinkOnboardingDeferred,
  persistShareLinkReturn,
} from "@/lib/contractor/share-link-onboarding";
import { SHARE_LINK_PLACEHOLDER_NAME } from "@/lib/contractor/project-share";
import type { ContractorInvitation } from "@/types";

type DialogStep = "intro" | "signup";

function hasShareLinkProfilePrefill(
  contactName: string,
  companyName: string,
  serviceArea: string
) {
  return (
    contactName.trim().length > 0 &&
    contactName.trim() !== SHARE_LINK_PLACEHOLDER_NAME &&
    companyName.trim().length > 0 &&
    serviceArea.trim().length > 0
  );
}

export function ContractorShareLinkOnboardingDialog({
  open,
  onOpenChange,
  token,
  homeownerName,
  invitation,
  signupOnly = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  homeownerName: string;
  invitation: ContractorInvitation;
  signupOnly?: boolean;
}) {
  const displayHomeownerName = formatShareLinkHomeownerName(homeownerName);
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(
    `/review/${token}?as=contractor`
  )}`;

  const storedPrefill = readContractorSignupPrefill();
  const [step, setStep] = useState<DialogStep>("intro");
  const [contactName, setContactName] = useState(
    storedPrefill?.contactName ||
      (invitation.contractor_name === SHARE_LINK_PLACEHOLDER_NAME
        ? ""
        : invitation.contractor_name)
  );
  const [companyName, setCompanyName] = useState(
    storedPrefill?.companyName || invitation.contractor_company || ""
  );
  const [serviceArea, setServiceArea] = useState(storedPrefill?.serviceArea ?? "");
  const [introError, setIntroError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    persistShareLinkReturn(token);

    const prefill = readContractorSignupPrefill();
    if (prefill?.contactName) {
      setContactName((current) => current || prefill.contactName || "");
    }
    if (prefill?.companyName) {
      setCompanyName((current) => current || prefill.companyName || "");
    }
    if (prefill?.serviceArea) {
      setServiceArea((current) => current || prefill.serviceArea || "");
    }

    if (signupOnly) {
      const contact = prefill?.contactName || contactName;
      const company = prefill?.companyName || companyName;
      const area = prefill?.serviceArea || serviceArea;
      setStep(
        hasShareLinkProfilePrefill(contact, company, area) ? "signup" : "intro"
      );
      return;
    }

    setStep("intro");
  }, [open, signupOnly, token]);

  function persistIdentityPrefill() {
    persistContractorSignupPrefill({
      email: "",
      contactName: contactName.trim(),
      companyName: companyName.trim(),
      serviceArea: serviceArea.trim(),
    });
  }

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

  function handleContinueToSignup(event: React.FormEvent) {
    event.preventDefault();
    setIntroError(null);

    if (!contactName.trim() || !companyName.trim() || !serviceArea.trim()) {
      setIntroError("Enter your name, company, and service area to continue.");
      return;
    }

    persistIdentityPrefill();
    setStep("signup");
  }

  const signupTitle = signupOnly
    ? "Create account to review and submit project estimate"
    : "Create your contractor account";

  const signupDescription = signupOnly
    ? "Sign up to build your estimate, add scope feedback, and submit your proposal."
    : "Use the email and password you want for managing projects and estimates.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md space-y-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:space-y-4 sm:p-6">
        <div className="flex justify-center pt-1">
          <ScopeBuddyLogo className="h-7 text-neutral-900" />
        </div>

        {step === "intro" ? (
          <div className="space-y-3">
            <DialogHeader className="mb-0 text-center">
              <DialogTitle className="font-display text-lg font-normal tracking-tight text-balance break-words sm:text-xl">
                {displayHomeownerName} shared a project with you
              </DialogTitle>
              <DialogDescription className="text-[var(--muted)]">
                Tell us about your business, then create an account when
                you&apos;re ready to estimate and submit your proposal.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleContinueToSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="share_link_contact_name">Your name</Label>
                <Input
                  id="share_link_contact_name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="How homeowners should address you"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="share_link_company_name">Company</Label>
                <Input
                  id="share_link_company_name"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Your company"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="share_link_service_area">Service area</Label>
                <Input
                  id="share_link_service_area"
                  value={serviceArea}
                  onChange={(event) => setServiceArea(event.target.value)}
                  placeholder="e.g. Los Angeles area"
                  required
                />
              </div>

              {introError ? (
                <p className="text-sm text-red-600">{introError}</p>
              ) : null}

              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>

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
                {signupTitle}
              </DialogTitle>
              <DialogDescription className="text-[var(--muted)]">
                {signupDescription}
              </DialogDescription>
            </DialogHeader>

            <ContractorAccountCreateForm
              prefill={{
                email: "",
                contactName: contactName.trim(),
                companyName: companyName.trim(),
                serviceArea: serviceArea.trim(),
              }}
              emailEditable
              onComplete={handleAccountComplete}
            />

            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href={signInHref}>Sign in with existing account</Link>
            </Button>

            {!signupOnly ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("intro")}
              >
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleDefer}
              >
                I&apos;ll do this later
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
