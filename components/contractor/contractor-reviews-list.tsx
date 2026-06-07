"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionSurface } from "@/components/layout/page-section";
import { formatReviewDate } from "@/lib/contractor/review-display";
import { formatProjectLocation } from "@/lib/location/parse";
import type { ContractorReviewListItem } from "@/lib/contractor/profile";
import {
  CONTRACTOR_INVITATION_STATUS_LABELS,
  formatProjectTypeLabel,
} from "@/types";

function reviewStatusBadge(item: ContractorReviewListItem) {
  if (item.is_selected_proposal) {
    return <Badge variant="success">Proposal accepted</Badge>;
  }

  if (item.estimate_status === "declined" || item.invitation.status === "closed_out") {
    return <Badge variant="secondary">Not selected</Badge>;
  }

  if (item.invitation.review?.status === "submitted" || item.invitation.status === "submitted") {
    return <Badge variant="info">Review submitted</Badge>;
  }

  if (item.invitation.status === "in_review") {
    return <Badge variant="pending">In progress</Badge>;
  }

  return (
    <Badge variant="secondary">
      {CONTRACTOR_INVITATION_STATUS_LABELS[item.invitation.status]}
    </Badge>
  );
}

function reviewMeta(item: ContractorReviewListItem) {
  const submittedAt =
    item.invitation.review?.submitted_at ?? item.invitation.updated_at;
  const parts = [
    formatProjectTypeLabel(item.project.project_type),
    formatProjectLocation(item.project),
    item.proposal_range ? `Proposal ${item.proposal_range}` : null,
    submittedAt ? `Updated ${formatReviewDate(submittedAt)}` : null,
  ].filter(Boolean);

  return parts.join(" · ");
}

export function ContractorReviewsList({
  reviews,
  emptyState = "in-review",
}: {
  reviews: ContractorReviewListItem[];
  emptyState?: "in-review" | "all";
}) {
  if (reviews.length === 0) {
    if (emptyState === "in-review") {
      return (
        <SectionSurface className="space-y-2">
          <p className="text-sm font-medium text-neutral-900">Nothing in review</p>
          <p className="text-sm text-[var(--muted)]">
            Projects you are reviewing or waiting on will show up here.
          </p>
        </SectionSurface>
      );
    }

    return (
      <SectionSurface className="space-y-2">
        <p className="text-sm font-medium text-neutral-900">No reviews yet</p>
        <p className="text-sm text-[var(--muted)]">
          When a homeowner invites you to review a project, it will show up here.
          You can still open review links from email while you wait.
        </p>
      </SectionSurface>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((item) => (
        <Link
          key={item.invitation.id}
          href={item.review_url}
          className="block"
        >
          <SectionSurface className="transition-colors hover:bg-neutral-50/80">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-neutral-900">
                    {item.project.title}
                  </p>
                  {reviewStatusBadge(item)}
                </div>
                <p className="text-sm text-[var(--muted)]">{reviewMeta(item)}</p>
              </div>
              <ChevronRight
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted)]"
                aria-hidden
              />
            </div>
          </SectionSurface>
        </Link>
      ))}
    </div>
  );
}
