import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import { createScopeItemSchema } from "@/lib/validators/scope";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("scope_items")
      .select("*")
      .eq("project_id", id)
      .eq("status", "active")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);
    const body = await request.json();
    const input = createScopeItemSchema.parse(body);
    const supabase = createServiceClient();

    const { count, error: countError } = await supabase
      .from("scope_items")
      .select("*", { count: "exact", head: true })
      .eq("project_id", id)
      .eq("status", "active");

    if (countError) throw countError;

    const { data, error } = await supabase
      .from("scope_items")
      .insert({
        project_id: id,
        category: input.category.toLowerCase(),
        text: input.text,
        source: "homeowner",
        priority: input.priority,
        status: "active",
        sort_order: count ?? 0,
        needs_verification: input.needs_verification ?? false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
