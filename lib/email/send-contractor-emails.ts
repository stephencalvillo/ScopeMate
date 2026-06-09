import { getEmailFrom, sendResendEmail } from "@/lib/email/client";
import {
  buildProjectReviewDetailUrl,
  buildProjectTabUrl,
  buildReviewUrl,
} from "@/lib/contractor/urls";

export async function sendProjectShareLinkEmail({
  to,
  homeownerName,
  projectTitle,
  reviewToken,
  expiresAt,
  request,
}: {
  to: string;
  homeownerName: string;
  projectTitle: string;
  reviewToken: string;
  expiresAt: Date;
  request?: Request;
}) {
  const reviewUrl = buildReviewUrl(reviewToken, request);
  const expiryLabel = expiresAt.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  await sendResendEmail({
    from: getEmailFrom(),
    to,
    subject: `${homeownerName} shared a project scope with you`,
    html: `
      <p><strong>${escapeHtml(homeownerName)}</strong> shared the scope for <strong>${escapeHtml(projectTitle)}</strong> on ScopeBuddy.</p>
      <p>Review the scope and suggest additions or changes before they move forward with pricing.</p>
      <p><a href="${reviewUrl}">Open project review</a></p>
      <p>This link expires on ${escapeHtml(expiryLabel)}.</p>
      <p style="color:#6b6b6b;font-size:14px;">ScopeBuddy is a planning tool. Contractors remain responsible for final scope verification and pricing.</p>
    `,
  });
}

export async function sendContractorInvitationEmail({
  to,
  contractorName,
  homeownerName,
  projectTitle,
  reviewToken,
  expiresAt,
  request,
}: {
  to: string;
  contractorName: string;
  homeownerName: string;
  projectTitle: string;
  reviewToken: string;
  expiresAt: Date;
  request?: Request;
}) {
  const reviewUrl = buildReviewUrl(reviewToken, request);
  const expiryLabel = expiresAt.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  await sendResendEmail({
    from: getEmailFrom(),
    to,
    subject: `${homeownerName} invited you to review a project scope`,
    html: `
      <p>Hi ${escapeHtml(contractorName)},</p>
      <p><strong>${escapeHtml(homeownerName)}</strong> invited you to review the scope for <strong>${escapeHtml(projectTitle)}</strong> on ScopeBuddy.</p>
      <p>You can suggest additions or changes before they share the project for pricing.</p>
      <p><a href="${reviewUrl}">Open project review</a></p>
      <p>This invitation expires on ${escapeHtml(expiryLabel)}.</p>
      <p style="color:#6b6b6b;font-size:14px;">ScopeBuddy is a planning tool. Contractors remain responsible for final scope verification and pricing.</p>
    `,
  });
}

export async function sendReviewCompleteEmail({
  to,
  homeownerName,
  contractorName,
  projectTitle,
  projectId,
  invitationId,
  suggestionCount,
  proposalMinTotal,
  proposalMaxTotal,
  request,
}: {
  to: string;
  homeownerName: string;
  contractorName: string;
  projectTitle: string;
  projectId: string;
  invitationId: string;
  suggestionCount: number;
  proposalMinTotal?: number | null;
  proposalMaxTotal?: number | null;
  request?: Request;
}) {
  const needsAttentionUrl = buildProjectTabUrl(
    projectId,
    "needs-attention",
    request
  );
  const reviewDetailUrl = buildProjectReviewDetailUrl(
    projectId,
    invitationId,
    request
  );
  const reviewedScopesUrl = buildProjectTabUrl(
    projectId,
    "reviewed-scopes",
    request
  );
  const countLabel =
    suggestionCount === 1
      ? "1 suggestion"
      : `${suggestionCount} suggestions`;
  const proposalLabel =
    proposalMinTotal != null &&
    proposalMaxTotal != null &&
    (proposalMinTotal > 0 || proposalMaxTotal > 0)
      ? formatProposalRangeForEmail(proposalMinTotal, proposalMaxTotal)
      : null;

  const summaryParts: string[] = [];
  if (suggestionCount > 0 && proposalLabel) {
    summaryParts.push(
      `They submitted ${escapeHtml(countLabel)} and a proposal of ${escapeHtml(proposalLabel)}.`
    );
  } else if (suggestionCount > 0) {
    summaryParts.push(
      `They submitted ${escapeHtml(countLabel)} for you to review.`
    );
  } else if (proposalLabel) {
    summaryParts.push(
      `They submitted a proposal of ${escapeHtml(proposalLabel)}.`
    );
  } else {
    summaryParts.push("They left feedback for you to review.");
  }

  const actionLinks: string[] = [];
  if (suggestionCount > 0) {
    actionLinks.push(
      `<p><a href="${needsAttentionUrl}">Review contractor suggestions</a></p>`
    );
  }
  if (proposalLabel) {
    actionLinks.push(
      `<p><a href="${reviewDetailUrl}">View submitted proposal</a></p>`
    );
  }
  if (actionLinks.length === 0) {
    actionLinks.push(
      `<p><a href="${reviewedScopesUrl}">Open reviewed scopes</a></p>`
    );
  }

  await sendResendEmail({
    from: getEmailFrom(),
    to,
    subject: `${contractorName} finished reviewing ${projectTitle}`,
    html: `
      <p>Hi ${escapeHtml(homeownerName)},</p>
      <p><strong>${escapeHtml(contractorName)}</strong> marked their review complete for <strong>${escapeHtml(projectTitle)}</strong>.</p>
      <p>${summaryParts.join(" ")}</p>
      ${actionLinks.join("\n      ")}
    `,
  });
}

function formatProposalRangeForEmail(minTotal: number, maxTotal: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (minTotal <= 0 && maxTotal <= 0) {
    return "";
  }

  if (minTotal === maxTotal) {
    return formatter.format(maxTotal);
  }

  return `${formatter.format(minTotal)} – ${formatter.format(maxTotal)}`;
}

export async function sendProposalAcceptedEmail({
  to,
  contractorName,
  homeownerName,
  projectTitle,
  proposalMinTotal,
  proposalMaxTotal,
  reviewToken,
  request,
}: {
  to: string;
  contractorName: string;
  homeownerName: string;
  projectTitle: string;
  proposalMinTotal: number;
  proposalMaxTotal: number;
  reviewToken: string;
  request?: Request;
}) {
  const reviewUrl = buildReviewUrl(reviewToken, request);
  const proposalLabel = formatProposalRangeForEmail(
    proposalMinTotal,
    proposalMaxTotal
  );

  await sendResendEmail({
    from: getEmailFrom(),
    to,
    subject: `Your proposal was accepted for ${projectTitle}`,
    html: `
      <p>Hi ${escapeHtml(contractorName)},</p>
      <p><strong>${escapeHtml(homeownerName)}</strong> accepted your proposal for <strong>${escapeHtml(projectTitle)}</strong>${proposalLabel ? ` (${escapeHtml(proposalLabel)})` : ""}.</p>
      <p><a href="${reviewUrl}">Open your review</a></p>
    `,
  });
}

export async function sendProposalNotSelectedEmail({
  to,
  contractorName,
  homeownerName,
  projectTitle,
  selectedContractorName,
  reviewToken,
  request,
}: {
  to: string;
  contractorName: string;
  homeownerName: string;
  projectTitle: string;
  selectedContractorName: string;
  reviewToken: string;
  request?: Request;
}) {
  const reviewUrl = buildReviewUrl(reviewToken, request);

  await sendResendEmail({
    from: getEmailFrom(),
    to,
    subject: `Update on ${projectTitle}`,
    html: `
      <p>Hi ${escapeHtml(contractorName)},</p>
      <p><strong>${escapeHtml(homeownerName)}</strong> selected another contractor for <strong>${escapeHtml(projectTitle)}</strong>.</p>
      <p>${escapeHtml(selectedContractorName)}'s proposal was accepted. This project is now closed on your review page.</p>
      <p><a href="${reviewUrl}">View your review</a></p>
    `,
  });
}

export async function sendFollowUpRequestedEmail({
  to,
  contractorName,
  projectTitle,
  reviewToken,
  message,
  request,
}: {
  to: string;
  contractorName: string;
  projectTitle: string;
  reviewToken: string;
  message: string;
  request?: Request;
}) {
  await sendResendEmail({
    from: getEmailFrom(),
    to,
    subject: `Follow-up question about ${projectTitle}`,
    html: `
      <p>Hi ${escapeHtml(contractorName)},</p>
      <p>The homeowner has a follow-up question about one of your suggestions on <strong>${escapeHtml(projectTitle)}</strong>:</p>
      <blockquote style="border-left:3px solid #e8e8e4;padding-left:12px;color:#404040;">${escapeHtml(message)}</blockquote>
      <p><a href="${buildReviewUrl(reviewToken, request)}">Respond on the review page</a></p>
    `,
  });
}

export async function sendFollowUpAnsweredEmail({
  to,
  homeownerName,
  contractorName,
  projectTitle,
  projectId,
  message,
  request,
}: {
  to: string;
  homeownerName: string;
  contractorName: string;
  projectTitle: string;
  projectId: string;
  message: string;
  request?: Request;
}) {
  const projectUrl = buildProjectTabUrl(projectId, "needs-attention", request);

  await sendResendEmail({
    from: getEmailFrom(),
    to,
    subject: `${contractorName} replied to your follow-up`,
    html: `
      <p>Hi ${escapeHtml(homeownerName)},</p>
      <p><strong>${escapeHtml(contractorName)}</strong> responded to your follow-up on <strong>${escapeHtml(projectTitle)}</strong>:</p>
      <blockquote style="border-left:3px solid #e8e8e4;padding-left:12px;color:#404040;">${escapeHtml(message)}</blockquote>
      <p><a href="${projectUrl}">Review the suggestion</a></p>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
