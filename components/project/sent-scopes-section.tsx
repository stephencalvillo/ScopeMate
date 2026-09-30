"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionSurface } from "@/components/layout/page-section";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { isShareLinkPlaceholder } from "@/lib/contractor/project-share";
import { buildSentScopeRows, type SentScopeRow } from "@/lib/project/sent-scope-rows";
import { useProjectShareDialog } from "@/components/project/project-share-ui";
import type {
  ContractorInvitationWithReview,
  ScopeSuggestionWithMeta,
} from "@/types";

function RowIcon({ kind }: { kind: SentScopeRow["kind"] }) {
  if (kind === "question") {
    return (
      <CircleAlert
        className="h-4 w-4 shrink-0 text-red-500"
        aria-hidden
      />
    );
  }

  if (kind === "submitted") {
    return (
      <CheckCircle2
        className="h-4 w-4 shrink-0 text-emerald-600"
        aria-hidden
      />
    );
  }

  return <FileText className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />;
}

export function SentScopesSection({
  projectId,
  refreshKey = 0,
  previewApiBase,
  reviewBasePath,
}: {
  projectId: string;
  refreshKey?: number;
  previewApiBase?: string;
  reviewBasePath?: string;
}) {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { openShareDialog } = useProjectShareDialog();
  const [rows, setRows] = useState<SentScopeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeRow, setActiveRow] = useState<SentScopeRow | null>(null);

  const loadRows = useCallback(async () => {
    const apiBase = previewApiBase ?? `/api/projects/${projectId}`;
    const fetchProjectApi = (path: string) =>
      isSignedIn ? authenticatedFetch(getToken, path) : fetch(path);

    try {
      const [invitationsResponse, suggestionsResponse] = await Promise.all([
        fetchProjectApi(`${apiBase}/invitations`),
        fetchProjectApi(`${apiBase}/suggestions`),
      ]);
      const [invitationsData, suggestionsData] = await Promise.all([
        invitationsResponse.json(),
        suggestionsResponse.json(),
      ]);

      const invitations = (
        invitationsResponse.ok ? (invitationsData.invitations ?? []) : []
      ) as ContractorInvitationWithReview[];
      const suggestions = (
        suggestionsResponse.ok ? (suggestionsData.suggestions ?? []) : []
      ) as ScopeSuggestionWithMeta[];

      setRows(buildSentScopeRows(invitations, suggestions));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn, previewApiBase, projectId]);

  useEffect(() => {
    if (!isLoaded) return;
    void loadRows();
  }, [isLoaded, loadRows, refreshKey]);

  async function remind(row: SentScopeRow) {
    setMessage(null);

    if (isShareLinkPlaceholder(row.invitation)) {
      openShareDialog();
      return;
    }

    setRemindingId(row.id);
    const response = await fetch(
      `/api/projects/${projectId}/invitations/${row.invitationId}/resend`,
      { method: "POST" }
    );
    setRemindingId(null);

    if (response.ok) {
      setMessage(`Reminder sent to ${row.invitation.contractor_email}.`);
      return;
    }

    openShareDialog();
  }

  function reviewHref(row: SentScopeRow) {
    if (reviewBasePath) return reviewBasePath;
    return `/projects/${projectId}/reviews/${row.invitationId}`;
  }

  function openReview(row: SentScopeRow) {
    if (row.pendingSuggestions.length > 0) {
      setActiveRow(row);
      return;
    }

    router.push(reviewHref(row));
  }

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg text-neutral-900">Sent scopes</h2>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading sent scopes
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No scopes sent yet. Share this project from the header to invite a
          contractor.
        </p>
      ) : (
        <SectionSurface className="p-0">
          <ul>
            {rows.map((row, index) => {
              const isReview = row.action === "review";

              return (
                <li
                  key={row.id}
                  className={
                    index < rows.length - 1
                      ? "border-b border-[var(--border)]"
                      : undefined
                  }
                >
                  <div
                    className={
                      isReview
                        ? "flex w-full cursor-pointer flex-col gap-3 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50/80 sm:flex-row sm:items-center sm:gap-3"
                        : "flex w-full flex-col gap-3 px-4 py-3.5 text-left sm:flex-row sm:items-center sm:gap-3"
                    }
                    role={isReview ? "button" : undefined}
                    tabIndex={isReview ? 0 : undefined}
                    onClick={isReview ? () => openReview(row) : undefined}
                    onKeyDown={
                      isReview
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openReview(row);
                            }
                          }
                        : undefined
                    }
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                    <RowIcon kind={row.kind} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900">
                        {row.title}
                      </p>
                      <p className="text-sm text-[var(--muted)]">{row.meta}</p>
                    </div>
                    </div>
                    {row.action === "remind" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled={remindingId === row.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          void remind(row);
                        }}
                      >
                        {remindingId === row.id ? "Sending..." : "Remind"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          openReview(row);
                        }}
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionSurface>
      )}

      {message ? (
        <p className="text-sm text-[var(--muted)]">{message}</p>
      ) : null}

      <Dialog
        open={activeRow !== null}
        onOpenChange={(open) => {
          if (!open) setActiveRow(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeRow?.title ?? "Contractor feedback"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {activeRow?.pendingSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                projectId={projectId}
                suggestion={suggestion}
                variant="needs-attention"
                reviewUrl={reviewHref(activeRow)}
                onUpdated={() => {
                  void loadRows();
                  setActiveRow(null);
                  router.refresh();
                }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
