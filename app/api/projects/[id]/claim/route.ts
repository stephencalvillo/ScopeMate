import { NextResponse } from "next/server";
import { claimGuestProject } from "@/lib/api/project-access";
import { jsonError } from "@/lib/api/response";
import { clearGuestProjectCookie } from "@/lib/auth/guest-project";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await claimGuestProject(id);
    const response = NextResponse.json(project);
    clearGuestProjectCookie(response);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
