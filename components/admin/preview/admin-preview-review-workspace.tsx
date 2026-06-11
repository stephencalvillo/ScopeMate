"use client";

import { ContractorReviewWorkspace } from "@/components/review/contractor-review-workspace";
import { PublicShell } from "@/components/layout/public-shell";
import { previewReviewShareLinkPayload } from "@/lib/admin/fixtures";
import { PREVIEW_REVIEW_TOKEN } from "@/lib/admin/fixtures/constants";

export function AdminPreviewReviewWorkspace() {
  return (
    <PublicShell
      subtitle="Contractor review"
      logoHref="/contractors"
      learnMoreHref="/contractors"
    >
      <ContractorReviewWorkspace
        token={PREVIEW_REVIEW_TOKEN}
        payload={previewReviewShareLinkPayload}
        onRefresh={() => undefined}
        onReviewSubmitted={async () => undefined}
      />
    </PublicShell>
  );
}
