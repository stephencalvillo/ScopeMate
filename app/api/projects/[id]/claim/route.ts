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

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await ensureUserRecord();
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
        claimed = await claimContractorGuestProject(id);
      } else {
        claimed = await claimContractorClientProjectForHomeowner(id, user);
      }
    } else {
      claimed = await claimGuestProject(id);
    }

    const response = NextResponse.json(claimed);
    clearGuestProjectCookie(response);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
