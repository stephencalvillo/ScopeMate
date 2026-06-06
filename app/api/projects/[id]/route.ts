import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import { getProjectForUser } from "@/lib/db/projects";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { updateProjectSchema } from "@/lib/validators/project";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await ensureUserRecord();
    const project = await getProjectForUser(id, user.id);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);
    const body = await request.json();
    const input = updateProjectSchema.parse(body);
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("projects")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);
    const supabase = createServiceClient();

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
