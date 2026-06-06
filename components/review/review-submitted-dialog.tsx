"use client";

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
import { SHARE_LINK_PLACEHOLDER_EMAIL } from "@/lib/contractor/project-share";
import type { ContractorInvitation } from "@/types";

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
  const needsEmail = invitation.contractor_email === SHARE_LINK_PLACEHOLDER_EMAIL;

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
              range.
            </p>
            <Button type="button" className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </>
        ) : (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="font-display text-xl font-normal tracking-tight text-balance">
                Finish creating your account to keep track of your projects
              </DialogTitle>
            </DialogHeader>

            <ContractorAccountCreateForm
              prefill={{
                email: needsEmail ? "" : invitation.contractor_email,
                contactName: invitation.contractor_name,
                companyName: invitation.contractor_company ?? "",
              }}
              emailEditable={needsEmail}
              onComplete={() => onOpenChange(false)}
            />

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Not now
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
