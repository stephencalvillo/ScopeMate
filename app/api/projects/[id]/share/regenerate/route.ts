import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { rotateProjectShareInvitation } from "@/lib/contractor/project-share";
import { buildShareUrl } from "@/lib/contractor/urls";
import { isMissingColumnError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import { generateShareToken } from "@/lib/security/tokens";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getOwnedProject(id);
    const homeowner = await ensureUserRecord();
    const supabase = createServiceClient();
    const previousShareToken = project.share_token;
    const token = generateShareToken();

    const now = new Date().toISOString();
    const baseUpdate = {
      share_token: token,
      share_enabled: true,
    };

    let result = await supabase
      .from("projects")
      .update({ ...baseUpdate, share_enabled_at: now })
      .eq("id", id)
      .select("*")
      .single();

    if (result.error && isMissingColumnError(result.error)) {
      result = await supabase
        .from("projects")
        .update(baseUpdate)
        .eq("id", id)
        .select("*")
        .single();
    }

    const { data, error } = result;
    if (error) throw error;

    await rotateProjectShareInvitation({
      project: data,
      invitedBy: homeowner.id,
      token: data.share_token,
      previousShareToken,
    });

    return NextResponse.json({
      share_url: buildShareUrl(data.share_token, request),
      share_enabled: data.share_enabled,
      share_expires_at: data.share_expires_at,
    });
  } catch (error) {
    return jsonError(error);
  }
}
