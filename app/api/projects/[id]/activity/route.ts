import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { listProjectActivity } from "@/lib/contractor/activity";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);
    const activity = await listProjectActivity(id);
    return NextResponse.json({ activity });
  } catch (error) {
    return jsonError(error);
  }
}
