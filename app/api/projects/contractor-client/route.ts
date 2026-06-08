import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import {
  generateGuestAccessToken,
  setGuestProjectCookie,
} from "@/lib/auth/guest-project";
import { ensureUserRecord, ForbiddenError } from "@/lib/auth/clerk";
import {
  getContractorProfile,
  isContractorProfileReady,
} from "@/lib/contractor/profile";
import { createDraftProject } from "@/lib/projects/create-draft-project";
import { createGuestProjectSchema } from "@/lib/validators/project";

export async function POST(request: Request) {
  try {
    const user = await ensureUserRecord();
    const profile = await getContractorProfile(user.id);

    if (!isContractorProfileReady(profile)) {
      throw new ForbiddenError(
        "Finish your contractor profile before creating a client project."
      );
    }

    const body = await request.json();
    const input = createGuestProjectSchema.parse(body);

    const guestAccessToken = generateGuestAccessToken();

    const data = await createDraftProject({
      original_description: input.original_description,
      zip: input.zip,
      target_start: input.target_start,
      creator_role: "contractor",
      created_by_user_id: user.id,
      guest_access_token: guestAccessToken,
    });

    const response = NextResponse.json(data, { status: 201 });
    setGuestProjectCookie(response, data.id, guestAccessToken);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
