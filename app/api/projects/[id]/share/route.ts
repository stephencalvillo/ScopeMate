import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import { generateShareToken } from "@/lib/security/tokens";
import { shareProjectSchema } from "@/lib/validators/project";

function buildShareUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/share/${token}`;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getOwnedProject(id);
    const body = await request.json().catch(() => ({}));
    const input = shareProjectSchema.parse(body);
    const supabase = createServiceClient();

    const token = project.share_token ?? generateShareToken();
    const expiresAt = input.expires_in_days
      ? new Date(Date.now() + input.expires_in_days * 24 * 60 * 60 * 1000)
      : null;

    const { data, error } = await supabase
      .from("projects")
      .update({
        share_token: token,
        share_enabled: true,
        share_expires_at: expiresAt?.toISOString() ?? null,
        status: "shared",
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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("projects")
      .update({
        share_enabled: false,
      })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ share_enabled: false });
  } catch (error) {
    return jsonError(error);
  }
}
