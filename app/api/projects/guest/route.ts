import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import {
  generateGuestAccessToken,
  setGuestProjectCookie,
} from "@/lib/auth/guest-project";
import { createDraftProject } from "@/lib/projects/create-draft-project";
import { createGuestProjectSchema } from "@/lib/validators/project";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createGuestProjectSchema.parse(body);
    const guestAccessToken = generateGuestAccessToken();

    const data = await createDraftProject({
      original_description: input.original_description,
      zip: input.zip,
      target_start: input.target_start,
      creator_role: input.creator_role ?? "homeowner",
      guest_access_token: guestAccessToken,
    });

    const response = NextResponse.json(
      { ...data, guest_access_token: guestAccessToken },
      { status: 201 }
    );
    setGuestProjectCookie(response, data.id, guestAccessToken);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
