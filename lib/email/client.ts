import { Resend } from "resend";
import type { CreateEmailOptions } from "resend";

export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigError";
  }
}

export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryError";
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

export async function sendResendEmail(payload: CreateEmailOptions) {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send(payload);

  if (error) {
    throw new EmailDeliveryError(error.message);
  }

  if (!data?.id) {
    throw new EmailDeliveryError("Email could not be sent.");
  }

  return data;
}
