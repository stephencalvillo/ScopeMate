import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/db/supabase";
import type { User } from "@/types";

export async function requireAuth() {
  const { userId } = await auth();
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

function resolveClerkEmail(
  clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>
) {
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

export async function ensureUserRecord(): Promise<User> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new AuthError("You need to sign in to continue.");
  }

  const email = resolveClerkEmail(clerkUser);

  if (!email) {
    throw new AuthError(
      "Verify your email address to continue. Check your inbox for a verification code or link."
    );
  }

  const supabase = createServiceClient();
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    null;

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("id", clerkUser.id)
    .maybeSingle();

  if (existing) {
    if (existing.email !== email || existing.name !== name) {
      const { data: updated, error } = await supabase
        .from("users")
        .update({ email, name })
        .eq("id", clerkUser.id)
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
      id: clerkUser.id,
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
