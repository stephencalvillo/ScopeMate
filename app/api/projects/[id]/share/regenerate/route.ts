import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import { generateShareToken } from "@/lib/security/tokens";

function buildShareUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/share/${token}`;
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);
    const supabase = createServiceClient();
    const token = generateShareToken();

    const { data, error } = await supabase
      .from("projects")
      .update({
        share_token: token,
        share_enabled: true,
      })
      .eq("id", id)
      .select("share_token, share_enabled, share_expires_at")
      .single();

    if (error) throw error;

    return NextResponse.json({
      share_url: buildShareUrl(data.share_token),
      share_enabled: data.share_enabled,
      share_expires_at: data.share_expires_at,
    });
  } catch (error) {
    return jsonError(error);
  }
}
