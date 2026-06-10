import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { listHomeownerSuggestions } from "@/lib/contractor/suggestions";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);
    const suggestions = await listHomeownerSuggestions(id);
    return NextResponse.json({ suggestions });
  } catch (error) {
    return jsonError(error);
  }
}
