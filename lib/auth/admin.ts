import { clerkClient } from "@clerk/nextjs/server";
import { ForbiddenError, resolveClerkUserId } from "@/lib/auth/clerk";
import {
  hasClerkAdminMetadata,
  isAdminConfigured,
  isAdminEmail,
  isAdminUserId,
} from "@/lib/auth/admin-config";

export { isAdminConfigured } from "@/lib/auth/admin-config";

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

  const clerkUser = await (await clerkClient()).users.getUser(userId);
  const email =
    clerkUser.emailAddresses.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;

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
