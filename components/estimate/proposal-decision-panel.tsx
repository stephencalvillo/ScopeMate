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
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";
import {
  formatProposalRange,
  PROPOSAL_DISCLAIMER,
  proposalRangeFromLineItems,
} from "@/lib/estimates/money";
import { cn, mobileFullWidthCtaClassName } from "@/lib/utils";
import type { ContractorEstimate } from "@/types";

type ProposalAcceptDockContextValue = {
  rangeLabel: string | null;
  canAccept: boolean;
  loading: boolean;
  error: string | null;
  handleAccept: () => void;
  headerSentinelRef: (node: HTMLDivElement | null) => void;
  inlineSentinelRef: (node: HTMLDivElement | null) => void;
  estimateStatus: ContractorEstimate["status"];
  isSelectedProposal: boolean;
  projectHasSelectedProposal: boolean;
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

function useAcceptProposal({
  projectId,
  invitationId,
}: {
  projectId: string;
  invitationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/reviews/${invitationId}/estimate/accept`,
        { method: "POST" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not accept this proposal.");
      }

      router.refresh();
    } catch (acceptError) {
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "Could not accept this proposal."
      );
    } finally {
      setLoading(false);
    }
  }, [invitationId, projectId, router]);

  return { loading, error, handleAccept };
}

function AcceptProposalButton({
  loading,
  onAccept,
  className,
}: {
  loading: boolean;
  onAccept: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      className={cn(mobileFullWidthCtaClassName, "shrink-0", className)}
      disabled={loading}
      onClick={onAccept}
    >
      {loading ? (
        "Accepting..."
      ) : (
        <>
          <Check className="h-4 w-4" aria-hidden />
          Accept proposal
        </>
      )}
    </Button>
  );
}

function ProposalEstimateCard({
  rangeLabel,
  canAccept,
  loading,
  error,
  onAccept,
  className,
}: {
  rangeLabel: string;
  canAccept: boolean;
  loading: boolean;
  error: string | null;
  onAccept: () => void;
  className?: string;
}) {
  return (
    <SectionSurface className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="font-display text-3xl tracking-tight text-neutral-900">
          {rangeLabel}
        </p>
        {canAccept ? (
          <AcceptProposalButton
            loading={loading}
            onAccept={onAccept}
            className="sm:ml-auto"
          />
        ) : null}
      </div>
      <p className="text-sm text-[var(--muted)]">{PROPOSAL_DISCLAIMER}</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </SectionSurface>
  );
}

function ProposalEstimateStatusCard({
  rangeLabel,
  estimateStatus,
  isSelectedProposal,
  projectHasSelectedProposal,
}: {
  rangeLabel: string | null;
  estimateStatus: ContractorEstimate["status"];
  isSelectedProposal: boolean;
  projectHasSelectedProposal: boolean;
}) {
  if (estimateStatus === "accepted" || isSelectedProposal) {
    return (
      <SectionSurface className="flex flex-wrap items-center gap-3">
        <Badge variant="success">Proposal accepted</Badge>
        <p className="text-sm text-neutral-800">
          You selected this contractor&apos;s proposal
          {rangeLabel ? ` (${rangeLabel})` : ""}. Other contractors have been
          notified.
        </p>
      </SectionSurface>
    );
  }

  if (estimateStatus === "declined") {
    return (
      <SectionSurface className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">Not selected</Badge>
        <p className="text-sm text-neutral-800">
          You accepted another contractor&apos;s proposal for this project.
        </p>
      </SectionSurface>
    );
  }

  if (projectHasSelectedProposal) {
    return (
      <SectionSurface>
        <p className="text-sm text-neutral-800">
          You already accepted a proposal for this project.
        </p>
      </SectionSurface>
    );
  }

  return null;
}

function ProposalEstimateFloatingDock({
  rangeLabel,
  loading,
  error,
  onAccept,
  animate,
}: {
  rangeLabel: string;
  loading: boolean;
  error: string | null;
  onAccept: () => void;
  animate: boolean;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-4 z-40 px-[var(--page-padding-x)]",
        animate && "share-dock-float-enter"
      )}
    >
      <div className="mx-auto max-w-5xl drop-shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <ProposalEstimateCard
          rangeLabel={rangeLabel}
          canAccept
          loading={loading}
          error={error}
          onAccept={onAccept}
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
  children,
}: {
  projectId: string;
  invitationId: string;
  estimate: ContractorEstimate;
  projectHasSelectedProposal: boolean;
  isSelectedProposal: boolean;
  children: ReactNode;
}) {
  const headerObserverRef = useRef<IntersectionObserver | null>(null);
  const inlineObserverRef = useRef<IntersectionObserver | null>(null);
  const [headerInView, setHeaderInView] = useState(true);
  const [inlineInView, setInlineInView] = useState(false);
  const [headerObserved, setHeaderObserved] = useState(false);
  const [inlineObserved, setInlineObserved] = useState(false);
  const [animateFloat, setAnimateFloat] = useState(false);
  const { loading, error, handleAccept } = useAcceptProposal({
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

  const headerSentinelRef = useCallback((node: HTMLDivElement | null) => {
    headerObserverRef.current?.disconnect();
    headerObserverRef.current = null;

    if (!node) return;

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

    if (!node) return;

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
        loading,
        error,
        handleAccept,
        headerSentinelRef,
        inlineSentinelRef,
        estimateStatus: estimate.status,
        isSelectedProposal,
        projectHasSelectedProposal,
      }}
    >
      {children}

      {showFloatingDock && rangeLabel ? (
        <ProposalEstimateFloatingDock
          rangeLabel={rangeLabel}
          loading={loading}
          error={error}
          onAccept={handleAccept}
          animate={animateFloat}
        />
      ) : null}
    </ProposalAcceptDockContext.Provider>
  );
}

export function ProposalEstimateHeaderSection() {
  const {
    rangeLabel,
    canAccept,
    loading,
    error,
    handleAccept,
    headerSentinelRef,
    estimateStatus,
    isSelectedProposal,
    projectHasSelectedProposal,
  } = useProposalAcceptDock();

  if (!rangeLabel && !canAccept) {
    return null;
  }

  return (
    <div ref={headerSentinelRef}>
      <PageSection title="Project estimate">
        {canAccept && rangeLabel ? (
          <ProposalEstimateCard
            rangeLabel={rangeLabel}
            canAccept
            loading={loading}
            error={error}
            onAccept={handleAccept}
          />
        ) : (
          <ProposalEstimateStatusCard
            rangeLabel={rangeLabel}
            estimateStatus={estimateStatus}
            isSelectedProposal={isSelectedProposal}
            projectHasSelectedProposal={projectHasSelectedProposal}
          />
        )}
      </PageSection>
    </div>
  );
}

export function ProposalEstimateEndSection() {
  const {
    rangeLabel,
    canAccept,
    loading,
    error,
    handleAccept,
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
        loading={loading}
        error={error}
        onAccept={handleAccept}
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
