import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { claimShareLinkInvitation } from "@/lib/contractor/share-link-claim";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const user = await ensureUserRecord(request);
    const invitation = await claimShareLinkInvitation(token, user, request);

    return NextResponse.json({ invitation });
  } catch (error) {
    return jsonError(error);
  }
}
