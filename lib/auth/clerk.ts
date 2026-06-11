import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { getAuthorizedParties } from "@/lib/auth/authorized-parties";
import { createServiceClient } from "@/lib/db/supabase";
import type { User } from "@/types";

export async function resolveClerkUserIdFromHeaders(): Promise<string | null> {
  const { userId } = await auth();
  if (userId) {
    return userId;
  }

  const headersList = await headers();
  const cookie = headersList.get("cookie");

  if (!cookie) {
    return null;
  }

  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const proto = headersList.get("x-forwarded-proto") ?? "https";

  if (!host) {
    return null;
  }

  const request = new Request(`${proto}://${host}/`, {
    headers: { cookie },
  });

  return resolveClerkUserId(request);
}

export async function resolveClerkUserId(
  request?: Request
): Promise<string | null> {
  if (request) {
    try {
      const client = await clerkClient();
      const state = await client.authenticateRequest(request, {
        authorizedParties: getAuthorizedParties(),
      });

      if (state.isAuthenticated) {
        const authState = state.toAuth();
        if (authState.userId) {
          return authState.userId;
        }
      }
    } catch (error) {
      console.error("Failed to authenticate bearer session token:", error);
    }
  }

  const { userId } = await auth();
  return userId ?? null;
}

export async function requireAuth(request?: Request) {
  const userId =
    (await resolveClerkUserId(request)) ??
    (await resolveClerkUserIdFromHeaders());
  if (!userId) {
    throw new AuthError("You need to sign in to continue.");
  }
  return userId;
}

export class AuthError extends Error {
  status = 401;

  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  status = 403;

  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  status = 404;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}

function resolveClerkEmailFromUser(clerkUser: {
  primaryEmailAddressId: string | null;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
    verification?: { status: string | null } | null;
  }>;
}) {
  return (
    clerkUser.emailAddresses.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses.find(
      (entry) => entry.verification?.status === "verified"
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null
  );
}

export async function ensureUserRecord(request?: Request): Promise<User> {
  const userId =
    (await resolveClerkUserId(request)) ??
    (await resolveClerkUserIdFromHeaders());
  if (!userId) {
    throw new AuthError("You need to sign in to continue.");
  }

  const cachedUser = await currentUser();
  const clerkUser =
    cachedUser?.id === userId
      ? cachedUser
      : await (await clerkClient()).users.getUser(userId);

  const email = resolveClerkEmailFromUser(clerkUser);

  if (!email) {
    throw new AuthError(
      "Verify your email address to continue. Check your inbox for a verification code or link."
    );
  }

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    null;

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    if (existing.email !== email || existing.name !== name) {
      const { data: updated, error } = await supabase
        .from("users")
        .update({ email, name })
        .eq("id", userId)
        .select("*")
        .single();

      if (error) throw error;
      return updated as User;
    }

    return existing as User;
  }

  const { data: created, error } = await supabase
    .from("users")
    .insert({
      id: userId,
      email,
      name,
      role: "homeowner",
    })
    .select("*")
    .single();

  if (error) {
    if (isUniqueViolation(error)) {
      throw new AuthError(
        "An account with this email already exists. Sign in with that email instead."
      );
    }

    throw error;
  }
  return created as User;
}
