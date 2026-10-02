import { displayContractorName } from "@/lib/contractor/display-contractor";
import { isShareLinkPlaceholder } from "@/lib/contractor/project-share";
import { isReviewSubmitted } from "@/lib/contractor/review-display";
import type {
  ContractorInvitationWithReview,
  ScopeSuggestionWithMeta,
} from "@/types";

export type SentScopeRowKind = "sent" | "question" | "submitted";
export type SentScopeRowAction = "share" | "review";

export type SentScopeRow = {
  id: string;
  invitationId: string;
  kind: SentScopeRowKind;
  title: string;
  meta: string;
  action: SentScopeRowAction;
  invitation: ContractorInvitationWithReview;
  pendingSuggestions: ScopeSuggestionWithMeta[];
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatMonthDay(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatWeekdayMonthDay(date: Date) {
  const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
  return `${weekday} ${formatMonthDay(date)}`;
}

function formatRelativeDay(date: Date, now: Date) {
  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000
  );
  const monthDay = formatMonthDay(date);

  if (diffDays === 0) return `today ${monthDay}`;
  if (diffDays === 1) return `yesterday ${monthDay}`;
  return formatWeekdayMonthDay(date);
}

export function formatSentScopeMeta(
  invitation: ContractorInvitationWithReview,
  now: Date = new Date()
) {
  const sent = `Sent ${formatWeekdayMonthDay(new Date(invitation.created_at))}`;

  if (isReviewSubmitted(invitation)) {
    const submittedAt =
      invitation.review?.submitted_at ?? invitation.updated_at;
    return `${sent} · Bid submitted ${formatMonthDay(new Date(submittedAt))}`;
  }

  const openedAt =
    invitation.first_accessed_at ?? invitation.last_accessed_at ?? null;

  if (openedAt) {
    return `${sent} · Opened ${formatRelativeDay(new Date(openedAt), now)}`;
  }

  return sent;
}

function isUnnamedShare(invitation: ContractorInvitationWithReview) {
  if (isShareLinkPlaceholder(invitation)) return true;
  const name = invitation.contractor_name?.trim();
  return !name || name === "Contractor";
}

function rowTitle(
  invitation: ContractorInvitationWithReview,
  kind: SentScopeRowKind
) {
  const name = displayContractorName(invitation);

  if (kind === "question") {
    return `${name} has a question`;
  }

  if (kind === "submitted") {
    return isUnnamedShare(invitation) ? "Contractor" : name;
  }

  return isUnnamedShare(invitation) ? "Sent scope" : name;
}

function rowKind(
  invitation: ContractorInvitationWithReview,
  pendingSuggestions: ScopeSuggestionWithMeta[]
): SentScopeRowKind {
  if (pendingSuggestions.length > 0) return "question";
  if (isReviewSubmitted(invitation)) return "submitted";
  return "sent";
}

export function buildSentScopeRows(
  invitations: ContractorInvitationWithReview[],
  suggestions: ScopeSuggestionWithMeta[],
  now: Date = new Date()
): SentScopeRow[] {
  const pendingByInvitation = new Map<string, ScopeSuggestionWithMeta[]>();

  for (const suggestion of suggestions) {
    if (suggestion.status !== "pending") continue;
    const current = pendingByInvitation.get(suggestion.invitation_id) ?? [];
    current.push(suggestion);
    pendingByInvitation.set(suggestion.invitation_id, current);
  }

  return invitations
    .filter((invitation) => invitation.status !== "revoked")
    .map((invitation) => {
      const pendingSuggestions = pendingByInvitation.get(invitation.id) ?? [];
      const kind = rowKind(invitation, pendingSuggestions);
      const action: SentScopeRowAction = kind === "sent" ? "share" : "review";

      return {
        id: invitation.id,
        invitationId: invitation.id,
        kind,
        title: rowTitle(invitation, kind),
        meta: formatSentScopeMeta(invitation, now),
        action,
        invitation,
        pendingSuggestions,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.invitation.created_at).getTime() -
        new Date(a.invitation.created_at).getTime()
    );
}
