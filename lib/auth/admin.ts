import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { getClerkSecretKeyError } from "@/lib/auth/clerk-config";
import { ForbiddenError, resolveClerkUserId } from "@/lib/auth/clerk";
import {
  hasClerkAdminMetadata,
  isAdminConfigured,
  isAdminEmail,
  isAdminUserId,
} from "@/lib/auth/admin-config";

export { isAdminConfigured } from "@/lib/auth/admin-config";

function resolveClerkEmail(clerkUser: {
  primaryEmailAddressId: string | null;
  emailAddresses: Array<{ id: string; emailAddress: string }>;
}) {
  return (
    clerkUser.emailAddresses.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null
  );
}

async function loadClerkUserForAdmin(userId: string, request?: Request) {
  if (!request) {
    const cached = await currentUser();
    if (cached?.id === userId) {
      return cached;
    }
  }

  try {
    const configError = getClerkSecretKeyError();
    if (configError) {
      throw new ForbiddenError(configError);
    }

    return await (await clerkClient()).users.getUser(userId);
  } catch (error) {
    console.error("Failed to load Clerk user for admin check:", error);
    throw new ForbiddenError(
      "Unable to verify admin access. Confirm CLERK_SECRET_KEY is set correctly in Vercel production, then redeploy."
    );
  }
}

export async function isAdminUser(userId: string, email?: string | null) {
  if (isAdminUserId(userId)) {
    return true;
  }

  if (isAdminEmail(email)) {
    return true;
  }

  return false;
}

export async function requireAdmin(request?: Request) {
  const userId = await resolveClerkUserId(request);

  if (!userId) {
    throw new ForbiddenError("You need to sign in to access the admin panel.");
  }

  const clerkUser = await loadClerkUserForAdmin(userId, request);
  const email = resolveClerkEmail(clerkUser);

  const allowed =
    hasClerkAdminMetadata(clerkUser.publicMetadata) ||
    (await isAdminUser(userId, email));

  if (!allowed) {
    if (!isAdminConfigured()) {
      throw new ForbiddenError(
        "Admin access is not configured. Set ADMIN_EMAILS or ADMIN_USER_IDS."
      );
    }

    throw new ForbiddenError("You do not have access to the admin panel.");
  }

  return { userId, email };
}
