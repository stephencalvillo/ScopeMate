"use client";

import { ContractorAccountCreateForm } from "@/components/review/contractor-account-create-form";

export function ContractorSignupForm() {
  return <ContractorAccountCreateForm emailEditable />;
}

export { CONTRACTOR_SIGNUP_STORAGE_KEY } from "@/lib/contractor/signup-prefill";
