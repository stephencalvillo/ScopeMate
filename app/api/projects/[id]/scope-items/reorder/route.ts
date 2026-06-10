import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import { reorderScopeItemsSchema } from "@/lib/validators/scope";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getAccessibleProject(id, { request });
    const body = await request.json();
    const input = reorderScopeItemsSchema.parse(body);
    const supabase = createServiceClient();

    const updates = input.item_ids.map((itemId, index) =>
      supabase
        .from("scope_items")
        .update({ sort_order: index })
        .eq("id", itemId)
        .eq("project_id", id)
    );

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
