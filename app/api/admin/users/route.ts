import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteUsers } from "@/lib/admin/delete-users";
import { jsonError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const deleteUsersSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1).max(100),
});

const noStoreHeaders = { "Cache-Control": "no-store" };

async function handleDeleteUsers(request: Request) {
  const admin = await requireAdmin();
  const body = deleteUsersSchema.parse(await request.json());

  if (body.userIds.includes(admin.userId)) {
    return NextResponse.json(
      { error: "You cannot delete your own account from the admin panel." },
      { status: 400, headers: noStoreHeaders }
    );
  }

  const result = await deleteUsers(body.userIds);

  if (result.deleted.length === 0) {
    return NextResponse.json(
      {
        error: result.failed[0]?.error ?? "No users were deleted.",
        failed: result.failed,
      },
      { status: 500, headers: noStoreHeaders }
    );
  }

  return NextResponse.json(result, { headers: noStoreHeaders });
}

export async function POST(request: Request) {
  try {
    return await handleDeleteUsers(request);
  } catch (error) {
    const response = jsonError(error);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}

export async function DELETE(request: Request) {
  try {
    return await handleDeleteUsers(request);
  } catch (error) {
    const response = jsonError(error);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
