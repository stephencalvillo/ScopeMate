import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { listReviewedScopesForProject } from "@/lib/contractor/reviewed-scopes";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id, request);
    const reviewed_scopes = await listReviewedScopesForProject(id);
    return NextResponse.json({ reviewed_scopes });
  } catch (error) {
    return jsonError(error);
  }
}
