import { NextResponse } from "next/server";
import {
  claimContractorClientProjectForHomeowner,
  claimContractorGuestProject,
  claimGuestProject,
  isContractorCreatedProject,
} from "@/lib/api/project-access";
import { jsonError } from "@/lib/api/response";
import { ensureUserRecord, NotFoundError } from "@/lib/auth/clerk";
import { clearGuestProjectCookie } from "@/lib/auth/guest-project";
import { getContractorProfile } from "@/lib/contractor/profile";
import { createServiceClient } from "@/lib/db/supabase";

function parseGuestToken(body: unknown): string | null {
  if (
    typeof body === "object" &&
    body !== null &&
    "guest_token" in body &&
    typeof (body as { guest_token: unknown }).guest_token === "string"
  ) {
    const token = (body as { guest_token: string }).guest_token.trim();
    return token.length > 0 ? token : null;
  }

  return null;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await ensureUserRecord(request);
    const body = await request.json().catch(() => ({}));
    const guestToken = parseGuestToken(body);
    const supabase = createServiceClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!project) {
      throw new NotFoundError("Project not found.");
    }

    let claimed;
    if (isContractorCreatedProject(project)) {
      const profile = await getContractorProfile(user.id);
      if (profile) {
        claimed = await claimContractorGuestProject(id, { guestToken, request });
      } else {
        claimed = await claimContractorClientProjectForHomeowner(id, user, request);
      }
    } else {
      claimed = await claimGuestProject(id, { guestToken, request });
    }

    const response = NextResponse.json(claimed);
    clearGuestProjectCookie(response);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
