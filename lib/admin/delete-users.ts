import { clerkClient } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/db/supabase";

export type DeleteUsersResult = {
  deleted: string[];
  failed: Array<{ userId: string; error: string }>;
};

function isClerkNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: number }).status === 404
  );
}

function isClerkUnauthorized(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: number }).status === 401
  );
}

function getErrorMessage(error: unknown) {
  if (isClerkUnauthorized(error)) {
    return "Clerk rejected the server API key. Update CLERK_SECRET_KEY in Vercel production and redeploy.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "Failed to delete user. Please try again.";
}

export async function deleteUsers(userIds: string[]): Promise<DeleteUsersResult> {
  const supabase = createServiceClient();
  const client = await clerkClient();
  const deleted: string[] = [];
  const failed: Array<{ userId: string; error: string }> = [];

  for (const userId of userIds) {
    try {
      try {
        await client.users.deleteUser(userId);
      } catch (error) {
        if (!isClerkNotFound(error)) {
          throw error;
        }
      }

      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (error) {
        throw error;
      }

      deleted.push(userId);
    } catch (error) {
      failed.push({
        userId,
        error: getErrorMessage(error),
      });
    }
  }

  return { deleted, failed };
}
