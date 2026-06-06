"use client";

import type { UpsertContractorProfileInput } from "@/lib/contractor/profile";
import {
  clearContractorSignupPrefill,
  readContractorSignupPrefill,
} from "@/lib/contractor/signup-prefill";

export async function completeContractorSignup(
  input: UpsertContractorProfileInput
) {
  const response = await fetch("/api/contractor/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      complete_onboarding: input.complete_onboarding ?? true,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Could not finish contractor setup.");
  }

  return data.profile as {
    user_id: string;
    company_name: string;
    contact_name: string;
  };
}

export async function finishContractorAccountSetup() {
  const prefill = readContractorSignupPrefill();
  const response = await fetch("/api/contractor/profile/complete-setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prefill: prefill
        ? {
            contactName: prefill.contactName,
            companyName: prefill.companyName,
          }
        : undefined,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Could not finish contractor setup.");
  }

  clearContractorSignupPrefill();

  return data as { ready: boolean };
}

export { clearContractorSignupPrefill, readContractorSignupPrefill };
