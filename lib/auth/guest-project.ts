import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateGuestAccessToken } from "@/lib/security/tokens";

export const GUEST_PROJECT_COOKIE = "scopemate_guest_project";
const GUEST_PROJECT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type GuestProjectCookie = {
  projectId: string;
  token: string;
};

export function createGuestProjectCookieValue(
  projectId: string,
  token: string
): string {
  return `${projectId}.${token}`;
}

export function parseGuestProjectCookieValue(
  value: string | undefined
): GuestProjectCookie | null {
  if (!value) return null;

  const separatorIndex = value.indexOf(".");
  if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
    return null;
  }

  return {
    projectId: value.slice(0, separatorIndex),
    token: value.slice(separatorIndex + 1),
  };
}

export async function getGuestProjectCookie(): Promise<GuestProjectCookie | null> {
  const cookieStore = await cookies();
  return parseGuestProjectCookieValue(
    cookieStore.get(GUEST_PROJECT_COOKIE)?.value
  );
}

export function setGuestProjectCookie(
  response: NextResponse,
  projectId: string,
  token: string
) {
  response.cookies.set({
    name: GUEST_PROJECT_COOKIE,
    value: createGuestProjectCookieValue(projectId, token),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GUEST_PROJECT_MAX_AGE_SECONDS,
  });
}

export function clearGuestProjectCookie(response: NextResponse) {
  response.cookies.set({
    name: GUEST_PROJECT_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export { generateGuestAccessToken };
