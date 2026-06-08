const CONTRACTOR_PROJECT_RETURN_KEY = "scopemate-contractor-project-return";

export function persistContractorProjectReturn(projectId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CONTRACTOR_PROJECT_RETURN_KEY, `/projects/${projectId}`);
}

export function readContractorProjectReturn(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CONTRACTOR_PROJECT_RETURN_KEY);
}

export function clearContractorProjectReturn() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CONTRACTOR_PROJECT_RETURN_KEY);
}
