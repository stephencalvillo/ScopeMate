"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionSurface } from "@/components/layout/page-section";
import {
  bidHistoryOutcomeBadgeVariant,
  bidHistoryOutcomeLabel,
  getBidHistoryOutcome,
  matchesBidHistoryFilter,
  type BidHistoryFilter,
} from "@/lib/contractor/bid-history-display";
import { formatReviewDate } from "@/lib/contractor/review-display";
import { formatProjectLocation } from "@/lib/location/parse";
import type { ContractorReviewListItem } from "@/lib/contractor/review-list-item";
import { formatProjectTypeLabel } from "@/types";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: BidHistoryFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "submitted", label: "Submitted" },
  { id: "declined", label: "Declined" },
  { id: "closed", label: "Closed" },
];

function bidHistoryMeta(item: ContractorReviewListItem) {
  const submittedAt =
    item.estimate_submitted_at ??
    item.invitation.review?.submitted_at ??
    item.invitation.updated_at;
  const parts = [
    formatProjectTypeLabel(item.project.project_type),
    formatProjectLocation(item.project),
    item.proposal_range ? `Proposal ${item.proposal_range}` : null,
    submittedAt ? formatReviewDate(submittedAt) : null,
  ].filter(Boolean);

  return parts.join(" · ");
}

function BidHistoryRow({ item }: { item: ContractorReviewListItem }) {
  const outcome = getBidHistoryOutcome(item);

  return (
    <Link href={`/contractor/bids/${item.invitation.id}`} className="block">
      <SectionSurface className="transition-colors hover:bg-neutral-50/80">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-neutral-900">
                {item.project.title}
              </p>
              <Badge variant={bidHistoryOutcomeBadgeVariant(outcome)}>
                {bidHistoryOutcomeLabel(outcome)}
              </Badge>
            </div>
            <p className="text-sm text-[var(--muted)]">{bidHistoryMeta(item)}</p>
          </div>
          <ChevronRight
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted)]"
            aria-hidden
          />
        </div>
      </SectionSurface>
    </Link>
  );
}

export function ContractorBidHistorySection({
  reviews,
}: {
  reviews: ContractorReviewListItem[];
}) {
  const [filter, setFilter] = useState<BidHistoryFilter>("all");
  const filteredReviews = useMemo(
    () => reviews.filter((item) => matchesBidHistoryFilter(item, filter)),
    [filter, reviews]
  );

  if (reviews.length === 0) {
    return (
      <SectionSurface className="space-y-2">
        <p className="text-sm font-medium text-neutral-900">No bid history yet</p>
        <p className="text-sm text-[var(--muted)]">
          Past proposals and closed reviews will show up here once you have
          finished jobs on ScopeMate.
        </p>
      </SectionSurface>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((entry) => (
          <Button
            key={entry.id}
            type="button"
            size="sm"
            variant={filter === entry.id ? "secondary" : "ghost"}
            className={cn(
              "h-8 rounded-full px-3 text-xs",
              filter === entry.id && "bg-neutral-900 text-white hover:bg-neutral-800"
            )}
            onClick={() => setFilter(entry.id)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <SectionSurface className="space-y-2">
          <p className="text-sm font-medium text-neutral-900">
            No bids match this filter
          </p>
          <p className="text-sm text-[var(--muted)]">
            Try another filter to see your past proposals.
          </p>
        </SectionSurface>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((item) => (
            <BidHistoryRow key={item.invitation.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
