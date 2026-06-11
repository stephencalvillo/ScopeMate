import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";

type GetToken = () => Promise<string | null>;

export function reviewAuthenticatedFetch(
  getToken: GetToken,
  token: string,
  path: string,
  init?: RequestInit
) {
  return authenticatedFetch(getToken, `/api/review/${token}${path}`, init);
}
