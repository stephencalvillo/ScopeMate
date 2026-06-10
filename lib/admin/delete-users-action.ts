"use server";

import { revalidatePath } from "next/cache";
import { deleteUsers } from "@/lib/admin/delete-users";
import { requireAdmin } from "@/lib/auth/admin";

export async function deleteAdminUsers(userIds: string[]) {
  const admin = await requireAdmin();

  if (userIds.length === 0) {
    throw new Error("Select at least one user to delete.");
  }

  if (userIds.length > 100) {
    throw new Error("You can delete up to 100 users at a time.");
  }

  if (userIds.includes(admin.userId)) {
    throw new Error("You cannot delete your own account from the admin panel.");
  }

  const result = await deleteUsers(userIds);

  if (result.deleted.length === 0) {
    throw new Error(
      result.failed[0]?.error ?? "No users were deleted. Please try again."
    );
  }

  revalidatePath("/adminpanel");

  return result;
}
