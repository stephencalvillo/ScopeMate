import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { syncAllFollowUpAnswersToScope } from "@/lib/follow-up/to-scope-item";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getOwnedProject(id);

    const scopeItems = await syncAllFollowUpAnswersToScope(
      id,
      project.project_type
    );

    return NextResponse.json({ scope_items: scopeItems });
  } catch (error) {
    return jsonError(error);
  }
}
