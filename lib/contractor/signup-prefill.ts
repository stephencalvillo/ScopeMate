export const CONTRACTOR_SIGNUP_STORAGE_KEY = "scopemate-contractor-signup";

export type ContractorSignupPrefill = {
  companyName?: string;
  contactName?: string;
  email?: string;
};

export function persistContractorSignupPrefill(prefill: ContractorSignupPrefill) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(
    CONTRACTOR_SIGNUP_STORAGE_KEY,
    JSON.stringify(prefill)
  );
}

export function readContractorSignupPrefill(): ContractorSignupPrefill | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(CONTRACTOR_SIGNUP_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ContractorSignupPrefill;
  } catch {
    return null;
  }
}

export function clearContractorSignupPrefill() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CONTRACTOR_SIGNUP_STORAGE_KEY);
}
