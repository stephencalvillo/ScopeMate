"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ContractorIdentityGate } from "@/components/review/contractor-identity-gate";
import { ContractorReviewWorkspace } from "@/components/review/contractor-review-workspace";
import { ReviewExpiredNotice } from "@/components/review/review-expired-notice";
import type { SharedPhoto } from "@/lib/phase2/client";
import type {
  ContractorInvitation,
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
  suggestions: ReviewSuggestion[];
};

export function ContractorReviewPage({ token }: { token: string }) {
  const [payload, setPayload] = useState<ReviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const loadReview = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadReview();
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

  if (!payload.invitation.accepted_at) {
    return (
      <ContractorIdentityGate
        token={token}
        invitation={payload.invitation}
        onComplete={loadReview}
      />
    );
  }

  return (
    <ContractorReviewWorkspace
      token={token}
      payload={payload}
      onRefresh={loadReview}
    />
  );
}
