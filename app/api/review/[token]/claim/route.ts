import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { claimShareLinkInvitation } from "@/lib/contractor/share-link-claim";

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const user = await ensureUserRecord();
    const invitation = await claimShareLinkInvitation(token, user);

    return NextResponse.json({ invitation });
  } catch (error) {
    return jsonError(error);
  }
}
