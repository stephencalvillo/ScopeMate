import { Resend } from "resend";

export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigError";
  }
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new EmailConfigError(
      "Email is not configured. Add RESEND_API_KEY to your environment."
    );
  }
  return new Resend(apiKey);
}

export function getEmailFrom() {
  return process.env.EMAIL_FROM ?? "onboarding@resend.dev";
}
