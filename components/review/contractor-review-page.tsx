"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ContractorIdentityGate } from "@/components/review/contractor-identity-gate";
import { ContractorReviewUnlock } from "@/components/review/contractor-review-unlock";
import { ContractorReviewWorkspace } from "@/components/review/contractor-review-workspace";
import { ContractorShareLinkOnboardingDialog } from "@/components/review/contractor-share-link-onboarding-dialog";
import { HomeownerContractorSharedReviewView } from "@/components/review/homeowner-contractor-shared-review-view";
import { HomeownerReviewEntryPrompt } from "@/components/review/homeowner-review-entry-prompt";
import { ReviewExpiredNotice } from "@/components/review/review-expired-notice";
import { ReviewSubmittedDialog } from "@/components/review/review-submitted-dialog";
import {
  ContractorShareLinkTransitionScreen,
  type ContractorShareLinkTransitionStep,
} from "@/components/review/contractor-share-link-transition-screen";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { finishContractorAccountSetup } from "@/lib/contractor/complete-signup";
import {
  clearShareLinkOnboardingDeferral,
  clearShareLinkPendingUnlock,
  clearShareLinkReturn,
  isShareLinkOnboardingDeferred,
  persistShareLinkReturn,
  readShareLinkPendingUnlock,
  readShareLinkReturn,
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
  is_contractor_client_project: boolean;
  homeowner_name: string;
};

export function ContractorReviewPage({ token }: { token: string }) {
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [payload, setPayload] = useState<ReviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [showSubmittedDialog, setShowSubmittedDialog] = useState(false);
  const [showShareLinkDialog, setShowShareLinkDialog] = useState(false);
  const [shareLinkSignupOnly, setShareLinkSignupOnly] = useState(false);
  const [linkingShareReview, setLinkingShareReview] = useState(false);
  const [transitionStep, setTransitionStep] =
    useState<ContractorShareLinkTransitionStep>("session");
  const [pendingShareLinkUnlock, setPendingShareLinkUnlock] = useState(
    () => readShareLinkPendingUnlock(token)
  );
  const [expectingShareLinkAccess, setExpectingShareLinkAccess] = useState(
    () => readShareLinkPendingUnlock(token)
  );
  const [linkShareReviewError, setLinkShareReviewError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isSignedIn) {
      setExpectingShareLinkAccess(false);
      return;
    }

    const shareReturn = readShareLinkReturn();
    if (shareReturn === `/review/${token}`) {
      setExpectingShareLinkAccess(true);
    }
  }, [isSignedIn, token]);

  const loadReview = useCallback(
    async (options?: { silent?: boolean; authenticated?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }

      try {
        const useAuthHeader = options?.authenticated ?? isSignedIn;
        const response = useAuthHeader
          ? await authenticatedFetch(getToken, `/api/review/${token}`)
          : await fetch(`/api/review/${token}`);
        const data = await response.json();
        if (!response.ok) {
          setUnavailable(true);
          return;
        }
        setPayload(data);
        setUnavailable(false);
        if (data.can_edit) {
          setExpectingShareLinkAccess(false);
          setPendingShareLinkUnlock(false);
          clearShareLinkPendingUnlock();
          clearShareLinkReturn();
        }
      } catch {
        setUnavailable(true);
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [getToken, isSignedIn, token]
  );

  useEffect(() => {
    if (!isLoaded) return;
    void loadReview({ authenticated: isSignedIn });
  }, [isLoaded, isSignedIn, loadReview]);

  const isHomeownerShareRecipient =
    payload?.is_share_link && payload?.is_contractor_client_project;

  useEffect(() => {
    if (!payload?.is_share_link || payload.can_edit) return;
    if (payload.review.status === "submitted") return;
    if (isHomeownerShareRecipient) return;
    if (!isLoaded || isSignedIn) return;

    persistShareLinkReturn(token);

    if (!isShareLinkOnboardingDeferred(token)) {
      setShowShareLinkDialog(true);
    }
  }, [isHomeownerShareRecipient, isLoaded, isSignedIn, payload, token]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !payload?.is_share_link || payload.can_edit) {
      return;
    }
    if (isHomeownerShareRecipient) return;
    if (!pendingShareLinkUnlock && !expectingShareLinkAccess && !readShareLinkReturn()) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLinkingShareReview(true);
      setLinkShareReviewError(null);
      setTransitionStep("session");

      try {
        setTransitionStep("profile");
        await finishContractorAccountSetup(getToken);

        setTransitionStep("claim");
        const response = await authenticatedFetch(
          getToken,
          `/api/review/${token}/claim`,
          { method: "POST" }
        );

        if (!response.ok || cancelled) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Could not link your account to this project."
          );
        }

        clearShareLinkOnboardingDeferral(token);
        clearShareLinkPendingUnlock();
        setPendingShareLinkUnlock(false);
        setExpectingShareLinkAccess(false);
        setTransitionStep("load");
        await loadReview({ silent: true, authenticated: true });
        setExpectingShareLinkAccess(false);
      } catch (linkError) {
        if (cancelled) return;
        setLinkShareReviewError(
          linkError instanceof Error
            ? linkError.message
            : "Could not link your account to this project."
        );
      } finally {
        if (!cancelled) {
          setLinkingShareReview(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    getToken,
    isHomeownerShareRecipient,
    isLoaded,
    isSignedIn,
    loadReview,
    payload?.can_edit,
    payload?.is_share_link,
    token,
  ]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !payload?.is_share_link || payload.can_edit) {
      return;
    }
    if (!isHomeownerShareRecipient) return;

    let cancelled = false;

    void (async () => {
      const claimResponse = await fetch(`/api/review/${token}/homeowner-claim`, {
        method: "POST",
      });

      if (!claimResponse.ok || cancelled) return;

      const redirectResponse = await fetch(
        `/api/review/${token}/homeowner-redirect`
      );
      const redirectData = await redirectResponse.json();

      if (!cancelled && redirectData.redirect) {
        window.location.assign(redirectData.redirect);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isHomeownerShareRecipient,
    isLoaded,
    isSignedIn,
    payload?.can_edit,
    payload?.is_share_link,
    token,
  ]);

  const handleReviewSubmitted = useCallback(async () => {
    await loadReview({ silent: true, authenticated: isSignedIn });
    window.scrollTo({ top: 0, behavior: "instant" });
    setShowSubmittedDialog(true);
  }, [isSignedIn, loadReview]);

  const requiresShareLinkAccount =
    payload?.is_share_link &&
    !payload?.is_contractor_client_project &&
    !payload?.can_edit &&
    payload?.review.status !== "submitted";

  const showShareLinkTransition =
    !linkShareReviewError &&
    !payload?.can_edit &&
    (pendingShareLinkUnlock ||
      (isSignedIn &&
        (linkingShareReview ||
          expectingShareLinkAccess ||
          Boolean(requiresShareLinkAccount)))) &&
    (payload
      ? payload.is_share_link &&
        !payload.is_contractor_client_project &&
        payload.review.status !== "submitted"
      : pendingShareLinkUnlock);

  if (showShareLinkTransition) {
    return (
      <ContractorShareLinkTransitionScreen
        projectTitle={payload?.project.title}
        step={transitionStep}
      />
    );
  }

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

  const requiresShareLinkAccountResolved =
    payload.is_share_link &&
    !payload.is_contractor_client_project &&
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
    !requiresShareLinkAccountResolved &&
    payload.review.status !== "submitted";

  const showHomeownerEntryPrompt =
    payload.is_share_link &&
    !payload.can_edit &&
    isLoaded &&
    !isSignedIn &&
    (isHomeownerShareRecipient || searchParams.get("as") !== "contractor");

  if (isHomeownerShareRecipient && payload.review.status !== "submitted") {
    return (
      <>
        {showHomeownerEntryPrompt ? (
          <HomeownerReviewEntryPrompt
            token={token}
            variant="contractor-shared"
          />
        ) : null}

        <HomeownerContractorSharedReviewView
          project={payload.project}
          photos={payload.photos}
          readiness={payload.readiness}
          contractorLabel={payload.homeowner_name}
        />
      </>
    );
  }

  return (
    <>
      {showHomeownerEntryPrompt ? (
        <HomeownerReviewEntryPrompt token={token} />
      ) : null}

      {showUnlock ? (
        <div className="mb-6">
          <ContractorReviewUnlock
            token={token}
            onUnlocked={() => loadReview({ silent: true, authenticated: isSignedIn })}
          />
        </div>
      ) : null}

      {linkShareReviewError ? (
        <p className="mb-4 text-sm text-red-600">{linkShareReviewError}</p>
      ) : null}

      <ContractorReviewWorkspace
        token={token}
        payload={payload}
        onRefresh={() => loadReview({ silent: true, authenticated: isSignedIn })}
        onReviewSubmitted={handleReviewSubmitted}
        requireAccountForEstimate={requiresShareLinkAccountResolved && !isSignedIn}
        onRequestAccount={() => {
          if (isSignedIn) return;
          setShareLinkSignupOnly(true);
          setShowShareLinkDialog(true);
        }}
      />

      {requiresShareLinkAccountResolved && !isSignedIn ? (
        <ContractorShareLinkOnboardingDialog
          open={showShareLinkDialog}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setShareLinkSignupOnly(false);
            }
            setShowShareLinkDialog(nextOpen);
          }}
          token={token}
          homeownerName={payload.homeowner_name ?? "A homeowner"}
          invitation={payload.invitation}
          signupOnly={shareLinkSignupOnly}
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
