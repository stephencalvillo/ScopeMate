"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ContractorIdentityGate } from "@/components/review/contractor-identity-gate";
import { ContractorReviewUnlock } from "@/components/review/contractor-review-unlock";
import { ContractorReviewWorkspace } from "@/components/review/contractor-review-workspace";
import { ContractorShareLinkOnboardingDialog } from "@/components/review/contractor-share-link-onboarding-dialog";
import { HomeownerReviewEntryPrompt } from "@/components/review/homeowner-review-entry-prompt";
import { ReviewExpiredNotice } from "@/components/review/review-expired-notice";
import { ReviewSubmittedDialog } from "@/components/review/review-submitted-dialog";
import {
  isShareLinkOnboardingDeferred,
  persistShareLinkReturn,
} from "@/lib/contractor/share-link-onboarding";
import type { SharedPhoto } from "@/lib/phase2/client";
import type { ProjectReadinessSummary as ProjectReadinessSummaryData } from "@/lib/project/readiness-summary";
import type {
  ContractorInvitation,
  ContractorEstimate,
  ContractorReview,
  ProjectWithScope,
  ScopeSuggestion,
  SuggestionFollowUp,
} from "@/types";

type ReviewSuggestion = ScopeSuggestion & { follow_ups?: SuggestionFollowUp[] };

type ReviewPayload = {
  invitation: ContractorInvitation;
  review: ContractorReview;
  project: ProjectWithScope;
  photos: SharedPhoto[];
  readiness: ProjectReadinessSummaryData;
  suggestions: ReviewSuggestion[];
  estimate?: ContractorEstimate | null;
  can_edit: boolean;
  is_share_link: boolean;
  homeowner_name: string;
};

export function ContractorReviewPage({ token }: { token: string }) {
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const [payload, setPayload] = useState<ReviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [showSubmittedDialog, setShowSubmittedDialog] = useState(false);
  const [showShareLinkDialog, setShowShareLinkDialog] = useState(false);

  const loadReview = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }

      try {
        const response = await fetch(`/api/review/${token}`);
        const data = await response.json();
        if (!response.ok) {
          setUnavailable(true);
          return;
        }
        setPayload(data);
        setUnavailable(false);
      } catch {
        setUnavailable(true);
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  useEffect(() => {
    if (!payload?.is_share_link || payload.can_edit) return;
    if (payload.review.status === "submitted") return;
    if (!isLoaded) return;

    persistShareLinkReturn(token);

    if (!isShareLinkOnboardingDeferred(token)) {
      setShowShareLinkDialog(true);
    }
  }, [isLoaded, payload, token]);

  useEffect(() => {
    if (!isSignedIn || !payload?.is_share_link || payload.can_edit) return;

    let cancelled = false;

    void (async () => {
      const response = await fetch(`/api/review/${token}/claim`, {
        method: "POST",
      });

      if (!response.ok || cancelled) return;
      await loadReview({ silent: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, loadReview, payload?.can_edit, payload?.is_share_link, token]);

  const handleReviewSubmitted = useCallback(async () => {
    await loadReview({ silent: true });
    window.scrollTo({ top: 0, behavior: "instant" });
    setShowSubmittedDialog(true);
  }, [loadReview]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading project review
      </div>
    );
  }

  if (unavailable || !payload) {
    return <ReviewExpiredNotice />;
  }

  const requiresShareLinkAccount =
    payload.is_share_link &&
    !payload.can_edit &&
    payload.review.status !== "submitted";

  if (!payload.invitation.accepted_at && !payload.is_share_link) {
    return (
      <ContractorIdentityGate
        token={token}
        invitation={payload.invitation}
        onComplete={() => loadReview()}
      />
    );
  }

  const showUnlock =
    payload.invitation.accepted_at &&
    !payload.can_edit &&
    !requiresShareLinkAccount &&
    payload.review.status !== "submitted";

  const showHomeownerEntryPrompt =
    searchParams.get("as") !== "contractor" &&
    payload.is_share_link &&
    !payload.can_edit &&
    isLoaded &&
    !isSignedIn;

  return (
    <>
      {showHomeownerEntryPrompt ? (
        <HomeownerReviewEntryPrompt token={token} />
      ) : null}

      {showUnlock ? (
        <div className="mb-6">
          <ContractorReviewUnlock
            token={token}
            onUnlocked={() => loadReview({ silent: true })}
          />
        </div>
      ) : null}

      <ContractorReviewWorkspace
        token={token}
        payload={payload}
        onRefresh={() => loadReview({ silent: true })}
        onReviewSubmitted={handleReviewSubmitted}
        requireAccountForEstimate={requiresShareLinkAccount}
        onRequestAccount={() => setShowShareLinkDialog(true)}
      />

      {requiresShareLinkAccount ? (
        <ContractorShareLinkOnboardingDialog
          open={showShareLinkDialog}
          onOpenChange={setShowShareLinkDialog}
          token={token}
          homeownerName={payload.homeowner_name ?? "A homeowner"}
          invitation={payload.invitation}
        />
      ) : null}

      <ReviewSubmittedDialog
        open={showSubmittedDialog}
        onOpenChange={setShowSubmittedDialog}
        invitation={payload.invitation}
      />
    </>
  );
}
