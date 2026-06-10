import { clerkClient } from "@clerk/nextjs/server";
import { isAdminEmail } from "@/lib/auth/admin-config";

export async function grantClerkAdminIfAllowed(userId: string, email: string) {
  if (!isAdminEmail(email)) {
    return false;
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: "admin",
    },
  });

  return true;
}
