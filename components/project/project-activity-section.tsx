"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Link2,
  Mail,
  PlayCircle,
} from "lucide-react";
import { ContractorInviteRow } from "@/components/contractor/contractor-invite-row";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import type { ProjectActivityItem, ProjectActivityKind } from "@/lib/contractor/activity";
import type { ContractorInvitationWithReview } from "@/types";

function activityIcon(kind: ProjectActivityKind) {
  switch (kind) {
    case "invitation_sent":
      return Mail;
    case "invitation_opened":
      return Eye;
    case "invitation_review_started":
      return PlayCircle;
    case "invitation_review_submitted":
      return CheckCircle2;
    case "share_link_created":
      return Link2;
    case "share_link_viewed":
      return Eye;
    default:
      return Eye;
  }
}

function formatActivityTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ProjectActivitySection({
  projectId,
  refreshKey = 0,
}: {
  projectId: string;
  refreshKey?: number;
}) {
  const [activity, setActivity] = useState<ProjectActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<
    Record<string, ContractorInvitationWithReview>
  >({});

  const loadActivity = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/activity`);
      const data = await response.json();
      if (response.ok) {
        const items = (data.activity ?? []) as ProjectActivityItem[];
        setActivity(items);
        setInvitations(
          Object.fromEntries(
            items
              .filter((item) => item.invitation)
              .map((item) => [item.invitation!.id, item.invitation!])
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity, refreshKey]);

  if (loading) {
    return null;
  }

  if (activity.length === 0) {
    return null;
  }

  return (
    <PageSection title="Activity">
      <SectionSurface className="space-y-4">
        <ul className="space-y-4">
          {activity.map((item) => {
            const Icon = activityIcon(item.kind);
            const invitation =
              item.invitation ?? invitations[item.invitation_id ?? ""];

            return (
              <li
                key={item.id}
                className="border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex gap-3">
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-neutral-900">
                        {item.title}
                      </p>
                      <time
                        className="text-xs text-[var(--muted)]"
                        dateTime={item.occurred_at}
                      >
                        {formatActivityTimestamp(item.occurred_at)}
                      </time>
                    </div>
                    {item.description ? (
                      <p className="text-sm text-[var(--muted)]">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                {item.kind === "invitation_sent" && invitation ? (
                  <div className="mt-3 pl-7">
                    <ContractorInviteRow
                      projectId={projectId}
                      invitation={invitation}
                      onRevoked={() => {
                        setInvitations((current) => ({
                          ...current,
                          [invitation.id]: {
                            ...invitation,
                            status: "revoked",
                          },
                        }));
                        loadActivity();
                      }}
                      onResent={() =>
                        setMessage(
                          `Invitation resent to ${invitation.contractor_email}.`
                        )
                      }
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>

        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}
      </SectionSurface>
    </PageSection>
  );
}
