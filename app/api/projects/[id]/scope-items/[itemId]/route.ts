import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import { updateScopeItemSchema } from "@/lib/validators/scope";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await context.params;
    await getAccessibleProject(id, { request });
    const body = await request.json();
    const input = updateScopeItemSchema.parse(body);
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("scope_items")
      .update({
        ...input,
        category: input.category?.toLowerCase(),
        source: "homeowner",
      })
      .eq("id", itemId)
      .eq("project_id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await context.params;
    await getAccessibleProject(id, { request });
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("scope_items")
      .update({ status: "removed" })
      .eq("id", itemId)
      .eq("project_id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}
