import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteUsers } from "@/lib/admin/delete-users";
import { jsonError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/admin";

const deleteUsersSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1).max(100),
});

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = deleteUsersSchema.parse(await request.json());

    if (body.userIds.includes(admin.userId)) {
      return NextResponse.json(
        { error: "You cannot delete your own account from the admin panel." },
        { status: 400 }
      );
    }

    const result = await deleteUsers(body.userIds);

    if (result.deleted.length === 0) {
      return NextResponse.json(
        {
          error: "No users were deleted.",
          failed: result.failed,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
