"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { isExplicitEstimateRejection } from "@/lib/estimates/estimate-rejection";
import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";
import {
  formatProposalRange,
  PROPOSAL_DISCLAIMER,
  proposalRangeFromLineItems,
} from "@/lib/estimates/money";
import { cn } from "@/lib/utils";
import type { ContractorEstimate } from "@/types";

type ProposalAcceptDockContextValue = {
  rangeLabel: string | null;
  canAccept: boolean;
  accepting: boolean;
  rejecting: boolean;
  error: string | null;
  handleAccept: () => void;
  requestReject: () => void;
  headerSentinelRef: (node: HTMLDivElement | null) => void;
  inlineSentinelRef: (node: HTMLDivElement | null) => void;
  estimateStatus: ContractorEstimate["status"];
  isSelectedProposal: boolean;
  projectHasSelectedProposal: boolean;
  explicitlyRejected: boolean;
};

const ProposalAcceptDockContext =
  createContext<ProposalAcceptDockContextValue | null>(null);

function useProposalAcceptDock() {
  const context = useContext(ProposalAcceptDockContext);
  if (!context) {
    throw new Error(
      "Proposal accept sections must be used within ProposalAcceptDockProvider"
    );
  }
  return context;
}

function useProposalDecision({
  projectId,
  invitationId,
}: {
  projectId: string;
  invitationId: string;
}) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [pendingAction, setPendingAction] = useState<"accept" | "reject" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const runDecision = useCallback(
    async (action: "accept" | "reject") => {
      setPendingAction(action);
      setError(null);

      const fallback =
        action === "accept"
          ? "Could not accept this estimate."
          : "Could not reject this estimate.";

      try {
        const response = await authenticatedFetch(
          getToken,
          `/api/projects/${projectId}/reviews/${invitationId}/estimate/${action}`,
          { method: "POST" }
        );
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? fallback);
        }

        router.refresh();
        return true;
      } catch (decisionError) {
        setError(
          decisionError instanceof Error ? decisionError.message : fallback
        );
        return false;
      } finally {
        setPendingAction(null);
      }
    },
    [getToken, invitationId, projectId, router]
  );

  const handleAccept = useCallback(() => {
    void runDecision("accept");
  }, [runDecision]);

  const handleReject = useCallback(() => runDecision("reject"), [runDecision]);

  const clearError = useCallback(() => setError(null), []);

  return {
    accepting: pendingAction === "accept",
    rejecting: pendingAction === "reject",
    busy: pendingAction !== null,
    error,
    handleAccept,
    handleReject,
    clearError,
  };
}

function EstimateDecisionButtons({
  accepting,
  rejecting,
  onAccept,
  onReject,
  className,
}: {
  accepting: boolean;
  rejecting: boolean;
  onAccept: () => void;
  onReject: () => void;
  className?: string;
}) {
  const busy = accepting || rejecting;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 @min-[22rem]:flex-row-reverse",
        className
      )}
    >
      <Button
        type="button"
        className="w-full @min-[22rem]:w-auto"
        disabled={busy}
        onClick={onAccept}
      >
        {accepting ? (
          "Accepting..."
        ) : (
          <>
            <Check className="h-4 w-4" aria-hidden />
            Accept estimate
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full @min-[22rem]:w-auto"
        disabled={busy}
        onClick={onReject}
      >
        {rejecting ? (
          "Rejecting..."
        ) : (
          <>
            <X className="h-4 w-4" aria-hidden />
            Reject
          </>
        )}
      </Button>
    </div>
  );
}

function ProposalEstimateCard({
  rangeLabel,
  canAccept,
  accepting,
  rejecting,
  error,
  onAccept,
  onReject,
  className,
  embedded = false,
}: {
  rangeLabel: string;
  canAccept: boolean;
  accepting: boolean;
  rejecting: boolean;
  error: string | null;
  onAccept: () => void;
  onReject: () => void;
  className?: string;
  embedded?: boolean;
}) {
  const decisionButtons = (placement: "beside-price" | "below") =>
    canAccept ? (
      <div
        className={
          placement === "beside-price"
            ? "hidden @min-[42rem]:block"
            : "@min-[42rem]:hidden"
        }
      >
        <EstimateDecisionButtons
          accepting={accepting}
          rejecting={rejecting}
          onAccept={onAccept}
          onReject={onReject}
          className={
            placement === "beside-price" ? "w-auto shrink-0" : undefined
          }
        />
      </div>
    ) : null;
  const body = (
    <div className="@container space-y-3">
      <div className="flex flex-col gap-4 @min-[42rem]:flex-row @min-[42rem]:items-center @min-[42rem]:justify-between @min-[42rem]:gap-6">
        <p className="min-w-0 font-display text-3xl tracking-tight text-neutral-900">
          {rangeLabel}
        </p>
        {decisionButtons("beside-price")}
      </div>
      <p className="text-sm text-[var(--muted)]">{PROPOSAL_DISCLAIMER}</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {decisionButtons("below")}
    </div>
  );

  if (embedded) {
    return body;
  }

  return (
    <SectionSurface className={cn("space-y-2", className)}>{body}</SectionSurface>
  );
}

function ProposalEstimateStatusCard({
  rangeLabel,
  estimateStatus,
  isSelectedProposal,
  projectHasSelectedProposal,
  explicitlyRejected,
  embedded = false,
  layout = "banner",
}: {
  rangeLabel: string | null;
  estimateStatus: ContractorEstimate["status"];
  isSelectedProposal: boolean;
  projectHasSelectedProposal: boolean;
  explicitlyRejected: boolean;
  embedded?: boolean;
  layout?: "banner" | "rail";
}) {
  const Surface = embedded ? "div" : SectionSurface;
  const rowClassName = cn(
    "flex flex-wrap items-center gap-3",
    layout === "rail" && "lg:flex-col lg:items-start"
  );

  if (estimateStatus === "accepted" || isSelectedProposal) {
    return (
      <Surface className={rowClassName}>
        <Badge variant="success">Proposal accepted</Badge>
        <p className="text-sm text-neutral-800">
          You selected this contractor&apos;s proposal
          {rangeLabel ? ` (${rangeLabel})` : ""}. Other contractors have been
          notified.
        </p>
      </Surface>
    );
  }

  if (explicitlyRejected) {
    return (
      <Surface className={rowClassName}>
        <Badge variant="secondary">Rejected</Badge>
        <p className="text-sm text-neutral-800">
          You rejected this estimate. The contractor can see that in their
          portal.
        </p>
      </Surface>
    );
  }

  if (estimateStatus === "declined") {
    return (
      <Surface className={rowClassName}>
        <Badge variant="secondary">Not selected</Badge>
        <p className="text-sm text-neutral-800">
          You accepted another contractor&apos;s proposal for this project.
        </p>
      </Surface>
    );
  }

  if (projectHasSelectedProposal) {
    return (
      <Surface>
        <p className="text-sm text-neutral-800">
          You already accepted a proposal for this project.
        </p>
      </Surface>
    );
  }

  return null;
}

function ProposalEstimateFloatingDock({
  rangeLabel,
  accepting,
  rejecting,
  error,
  onAccept,
  onReject,
  animate,
}: {
  rangeLabel: string;
  accepting: boolean;
  rejecting: boolean;
  error: string | null;
  onAccept: () => void;
  onReject: () => void;
  animate: boolean;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-4 z-40 px-[var(--page-padding-x)] lg:hidden",
        animate && "share-dock-float-enter"
      )}
    >
      <div className="mx-auto max-w-7xl drop-shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <ProposalEstimateCard
          rangeLabel={rangeLabel}
          canAccept
          accepting={accepting}
          rejecting={rejecting}
          error={error}
          onAccept={onAccept}
          onReject={onReject}
          className="bg-white/95 backdrop-blur-sm"
        />
      </div>
    </div>
  );
}

export function ProposalAcceptDockProvider({
  projectId,
  invitationId,
  estimate,
  projectHasSelectedProposal,
  isSelectedProposal,
  invitationStatus,
  contractorName,
  children,
}: {
  projectId: string;
  invitationId: string;
  estimate: ContractorEstimate;
  projectHasSelectedProposal: boolean;
  isSelectedProposal: boolean;
  invitationStatus?: string | null;
  contractorName?: string | null;
  children: ReactNode;
}) {
  const headerObserverRef = useRef<IntersectionObserver | null>(null);
  const inlineObserverRef = useRef<IntersectionObserver | null>(null);
  const [headerInView, setHeaderInView] = useState(true);
  const [inlineInView, setInlineInView] = useState(false);
  const [headerObserved, setHeaderObserved] = useState(false);
  const [inlineObserved, setInlineObserved] = useState(false);
  const [animateFloat, setAnimateFloat] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const {
    accepting,
    rejecting,
    busy,
    error,
    handleAccept,
    handleReject,
    clearError,
  } = useProposalDecision({
    projectId,
    invitationId,
  });

  const lineItems = estimate.line_items ?? [];
  const { minTotal, maxTotal } = proposalRangeFromLineItems(lineItems);
  const rangeLabel = formatProposalRange(minTotal, maxTotal);
  const canAccept =
    Boolean(rangeLabel) &&
    estimate.status === "submitted" &&
    !projectHasSelectedProposal &&
    !isSelectedProposal;
  const explicitlyRejected = isExplicitEstimateRejection({
    estimateStatus: estimate.status,
    invitationStatus,
  });
  const contractorLabel = contractorName?.trim() || "This contractor";

  const headerSentinelRef = useCallback((node: HTMLDivElement | null) => {
    headerObserverRef.current?.disconnect();
    headerObserverRef.current = null;

    if (!node) {
      setHeaderInView(false);
      setHeaderObserved(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeaderObserved(true);
        setHeaderInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -8px 0px" }
    );

    observer.observe(node);
    headerObserverRef.current = observer;
  }, []);

  const inlineSentinelRef = useCallback((node: HTMLDivElement | null) => {
    inlineObserverRef.current?.disconnect();
    inlineObserverRef.current = null;

    if (!node) {
      setInlineInView(false);
      setInlineObserved(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInlineObserved(true);
        setInlineInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -8px 0px" }
    );

    observer.observe(node);
    inlineObserverRef.current = observer;
  }, []);

  useEffect(() => {
    return () => {
      headerObserverRef.current?.disconnect();
      inlineObserverRef.current?.disconnect();
    };
  }, []);

  const hasObserved = headerObserved || inlineObserved;
  const showFloatingDock =
    canAccept && hasObserved && !headerInView && !inlineInView;

  useEffect(() => {
    if (!showFloatingDock) {
      setAnimateFloat(false);
      return;
    }

    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        setAnimateFloat(true);
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [showFloatingDock]);

  if (!rangeLabel && !canAccept) {
    return <>{children}</>;
  }

  return (
    <ProposalAcceptDockContext.Provider
      value={{
        rangeLabel,
        canAccept,
        accepting,
        rejecting,
        error,
        handleAccept,
        requestReject: () => {
          clearError();
          setConfirmRejectOpen(true);
        },
        headerSentinelRef,
        inlineSentinelRef,
        estimateStatus: estimate.status,
        isSelectedProposal,
        projectHasSelectedProposal,
        explicitlyRejected,
      }}
    >
      {children}

      {showFloatingDock && rangeLabel ? (
        <ProposalEstimateFloatingDock
          rangeLabel={rangeLabel}
          accepting={accepting}
          rejecting={rejecting}
          error={error}
          onAccept={handleAccept}
          onReject={() => {
            clearError();
            setConfirmRejectOpen(true);
          }}
          animate={animateFloat}
        />
      ) : null}

      <Dialog
        open={confirmRejectOpen}
        onOpenChange={(open) => {
          if (!busy) setConfirmRejectOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this estimate?</DialogTitle>
            <DialogDescription>
              {`${contractorLabel} will see that you rejected their estimate in their portal. This won't accept anyone else.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => setConfirmRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => {
                void handleReject().then((rejected) => {
                  if (rejected) setConfirmRejectOpen(false);
                });
              }}
            >
              {rejecting ? "Rejecting..." : "Reject estimate"}
            </Button>
          </div>
          {error && confirmRejectOpen ? (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          ) : null}
        </DialogContent>
      </Dialog>
    </ProposalAcceptDockContext.Provider>
  );
}

export function ProposalEstimateHeaderSection({
  embedded = false,
  layout = "banner",
}: {
  embedded?: boolean;
  layout?: "banner" | "rail";
}) {
  const {
    rangeLabel,
    canAccept,
    accepting,
    rejecting,
    error,
    handleAccept,
    requestReject,
    headerSentinelRef,
    estimateStatus,
    isSelectedProposal,
    projectHasSelectedProposal,
    explicitlyRejected,
  } = useProposalAcceptDock();

  if (!rangeLabel && !canAccept) {
    return null;
  }

  const body =
    canAccept && rangeLabel ? (
      <ProposalEstimateCard
        rangeLabel={rangeLabel}
        canAccept
        accepting={accepting}
        rejecting={rejecting}
        error={error}
        onAccept={handleAccept}
        onReject={requestReject}
        embedded={embedded}
      />
    ) : (
      <ProposalEstimateStatusCard
        rangeLabel={rangeLabel}
        estimateStatus={estimateStatus}
        isSelectedProposal={isSelectedProposal}
        projectHasSelectedProposal={projectHasSelectedProposal}
        explicitlyRejected={explicitlyRejected}
        embedded={embedded}
        layout={layout}
      />
    );

  if (embedded) {
    return <div ref={headerSentinelRef}>{body}</div>;
  }

  return (
    <div ref={headerSentinelRef}>
      <PageSection title="Project estimate">{body}</PageSection>
    </div>
  );
}

export function ProposalEstimateEndSection() {
  const {
    rangeLabel,
    canAccept,
    accepting,
    rejecting,
    error,
    handleAccept,
    requestReject,
    inlineSentinelRef,
  } = useProposalAcceptDock();

  if (!canAccept || !rangeLabel) {
    return null;
  }

  return (
    <div ref={inlineSentinelRef}>
      <ProposalEstimateCard
        rangeLabel={rangeLabel}
        canAccept
        accepting={accepting}
        rejecting={rejecting}
        error={error}
        onAccept={handleAccept}
        onReject={requestReject}
      />
    </div>
  );
}

/** @deprecated Use ProposalAcceptDockProvider with header/end sections */
export function ProposalDecisionPanel({
  projectId,
  invitationId,
  estimate,
  projectHasSelectedProposal,
  isSelectedProposal,
}: {
  projectId: string;
  invitationId: string;
  estimate: ContractorEstimate;
  projectHasSelectedProposal: boolean;
  isSelectedProposal: boolean;
}) {
  return (
    <ProposalAcceptDockProvider
      projectId={projectId}
      invitationId={invitationId}
      estimate={estimate}
      projectHasSelectedProposal={projectHasSelectedProposal}
      isSelectedProposal={isSelectedProposal}
    >
      <ProposalEstimateHeaderSection />
      <ProposalEstimateEndSection />
    </ProposalAcceptDockProvider>
  );
}
