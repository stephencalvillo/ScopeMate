"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionSurface } from "@/components/layout/page-section";
import { formatProposalRange, proposalRangeFromLineItems } from "@/lib/estimates/money";
import { cn } from "@/lib/utils";
import type { ContractorEstimate } from "@/types";

const ACCEPT_DESCRIPTION =
  "Accepting this proposal will notify this contractor and automatically decline other submitted proposals on this project.";

const FLOAT_DESCRIPTION =
  "Accept this contractor's proposal. Other submitted proposals will be declined.";

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

function AcceptProposalActions({
  loading,
  error,
  onAccept,
  layout,
}: {
  loading: boolean;
  error: string | null;
  onAccept: () => void;
  layout: "inline" | "float";
}) {
  if (layout === "float") {
    return (
      <>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">{FLOAT_DESCRIPTION}</p>
          <div className="flex shrink-0 justify-end">
            <Button type="button" disabled={loading} onClick={onAccept}>
              {loading ? "Accepting..." : "Accept proposal"}
            </Button>
          </div>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </>
    );
  }

  return (
    <>
      <p className="text-sm text-neutral-800">{ACCEPT_DESCRIPTION}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={loading} onClick={onAccept}>
          {loading ? "Accepting..." : "Accept proposal"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </>
  );
}

function AcceptProposalFloatingDock({
  loading,
  error,
  onAccept,
  animate,
}: {
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
        <SectionSurface className="space-y-3 bg-white/95 backdrop-blur-sm">
          <AcceptProposalActions
            layout="float"
            loading={loading}
            error={error}
            onAccept={onAccept}
          />
        </SectionSurface>
      </div>
    </div>
  );
}

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
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelInView, setPanelInView] = useState(true);
  const [observed, setObserved] = useState(false);
  const [animateFloat, setAnimateFloat] = useState(false);
  const { loading, error, handleAccept } = useAcceptProposal({
    projectId,
    invitationId,
  });

  const { minTotal, maxTotal } = proposalRangeFromLineItems(estimate.line_items ?? []);
  const range = formatProposalRange(minTotal, maxTotal);
  const canAccept =
    estimate.status === "submitted" &&
    !projectHasSelectedProposal &&
    !isSelectedProposal;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !canAccept) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setObserved(true);
        setPanelInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -8px 0px" }
    );

    observer.observe(panel);
    return () => {
      observer.disconnect();
      setPanelInView(true);
    };
  }, [canAccept]);

  const showFloatingDock = canAccept && observed && !panelInView;

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

  if (estimate.status === "accepted" || isSelectedProposal) {
    return (
      <SectionSurface className="flex flex-wrap items-center gap-3">
        <Badge variant="success">Proposal accepted</Badge>
        <p className="text-sm text-neutral-800">
          You selected this contractor&apos;s proposal{range ? ` (${range})` : ""}.
          Other contractors have been notified.
        </p>
      </SectionSurface>
    );
  }

  if (estimate.status === "declined") {
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

  if (!canAccept) {
    return null;
  }

  return (
    <>
      <div ref={panelRef}>
        <SectionSurface className="space-y-3">
          <AcceptProposalActions
            layout="inline"
            loading={loading}
            error={error}
            onAccept={handleAccept}
          />
        </SectionSurface>
      </div>

      {showFloatingDock ? (
        <AcceptProposalFloatingDock
          loading={loading}
          error={error}
          onAccept={handleAccept}
          animate={animateFloat}
        />
      ) : null}
    </>
  );
}
