import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import type { AiRun } from "@/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("ai_runs")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json((data ?? []) as AiRun[]);
  } catch (error) {
    return jsonError(error);
  }
}
