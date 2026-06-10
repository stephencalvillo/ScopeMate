import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getGuestProjectCookie } from "@/lib/auth/guest-project";
import { createServiceClient } from "@/lib/db/supabase";
import { NotFoundError } from "@/lib/auth/clerk";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const guest = await getGuestProjectCookie();

    if (!guest || guest.projectId !== id) {
      return NextResponse.json({ error: "Guest access not found." }, { status: 404 });
    }

    const supabase = createServiceClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select("guest_access_token")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!project?.guest_access_token || project.guest_access_token !== guest.token) {
      throw new NotFoundError("Project not found.");
    }

    return NextResponse.json({ guest_access_token: guest.token });
  } catch (error) {
    return jsonError(error);
  }
}
