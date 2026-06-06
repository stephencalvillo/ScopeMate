import { getEmailFrom, getResendClient } from "@/lib/email/client";
import { buildProjectUrl, buildReviewUrl } from "@/lib/contractor/urls";

export async function sendContractorInvitationEmail({
  to,
  contractorName,
  homeownerName,
  projectTitle,
  reviewToken,
  expiresAt,
}: {
  to: string;
  contractorName: string;
  homeownerName: string;
  projectTitle: string;
  reviewToken: string;
  expiresAt: Date;
}) {
  const resend = getResendClient();
  const reviewUrl = buildReviewUrl(reviewToken);
  const expiryLabel = expiresAt.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: `${homeownerName} invited you to review a project scope`,
    html: `
      <p>Hi ${escapeHtml(contractorName)},</p>
      <p><strong>${escapeHtml(homeownerName)}</strong> invited you to review the scope for <strong>${escapeHtml(projectTitle)}</strong> on ScopeMate.</p>
      <p>You can suggest additions or changes before they share the project for pricing.</p>
      <p><a href="${reviewUrl}">Open project review</a></p>
      <p>This invitation expires on ${escapeHtml(expiryLabel)}.</p>
      <p style="color:#6b6b6b;font-size:14px;">ScopeMate is a planning tool. Contractors remain responsible for final scope verification and pricing.</p>
    `,
  });
}

export async function sendReviewCompleteEmail({
  to,
  homeownerName,
  contractorName,
  projectTitle,
  projectUrl,
  suggestionCount,
}: {
  to: string;
  homeownerName: string;
  contractorName: string;
  projectTitle: string;
  projectUrl: string;
  suggestionCount: number;
}) {
  const resend = getResendClient();
  const countLabel =
    suggestionCount === 1
      ? "1 suggestion"
      : `${suggestionCount} suggestions`;

  await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: `${contractorName} finished reviewing ${projectTitle}`,
    html: `
      <p>Hi ${escapeHtml(homeownerName)},</p>
      <p><strong>${escapeHtml(contractorName)}</strong> marked their review complete for <strong>${escapeHtml(projectTitle)}</strong>.</p>
      <p>They submitted ${escapeHtml(countLabel)} for you to review.</p>
      <p><a href="${projectUrl}">Review contractor suggestions</a></p>
    `,
  });
}

export async function sendFollowUpRequestedEmail({
  to,
  contractorName,
  projectTitle,
  reviewToken,
  message,
}: {
  to: string;
  contractorName: string;
  projectTitle: string;
  reviewToken: string;
  message: string;
}) {
  const resend = getResendClient();

  await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: `Follow-up question about ${projectTitle}`,
    html: `
      <p>Hi ${escapeHtml(contractorName)},</p>
      <p>The homeowner has a follow-up question about one of your suggestions on <strong>${escapeHtml(projectTitle)}</strong>:</p>
      <blockquote style="border-left:3px solid #e8e8e4;padding-left:12px;color:#404040;">${escapeHtml(message)}</blockquote>
      <p><a href="${buildReviewUrl(reviewToken)}">Respond on the review page</a></p>
    `,
  });
}

export async function sendFollowUpAnsweredEmail({
  to,
  homeownerName,
  contractorName,
  projectTitle,
  projectUrl,
  message,
}: {
  to: string;
  homeownerName: string;
  contractorName: string;
  projectTitle: string;
  projectUrl: string;
  message: string;
}) {
  const resend = getResendClient();

  await resend.emails.send({
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
