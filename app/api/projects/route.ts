import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { createServiceClient } from "@/lib/db/supabase";
import { isMissingColumnError } from "@/lib/db/errors";
import { listProjectsForUser } from "@/lib/db/projects";
import { parseLocation } from "@/lib/location/parse";
import { lookupCityStateFromZip } from "@/lib/location/zip-lookup";
import { createProjectSchema } from "@/lib/validators/project";

function deriveTitle(description: string, provided?: string): string {
  if (provided?.trim()) return provided.trim();

  const firstSentence = description.split(/[.!?\n]/)[0]?.trim();
  if (firstSentence && firstSentence.length <= 80) {
    return firstSentence;
  }

  return description.trim().slice(0, 60).trim() + (description.length > 60 ? "..." : "");
}

export async function GET() {
  try {
    const user = await ensureUserRecord();
    const projects = await listProjectsForUser(user.id);
    return NextResponse.json(projects);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await ensureUserRecord();
    const body = await request.json();
    const input = createProjectSchema.parse(body);
    const parsed = parseLocation(input.location);
    let city = parsed.city || parsed.location;

    if (!parsed.city && parsed.zip) {
      const cityState = await lookupCityStateFromZip(parsed.zip);
      if (cityState) {
        city = cityState;
      }
    }

    const supabase = createServiceClient();

    const baseRow = {
      homeowner_id: user.id,
      title: deriveTitle(input.original_description, input.title),
      project_type: "unspecified",
      city,
      zip: parsed.zip || "N/A",
      original_description: input.original_description,
      status: "draft" as const,
    };

    let { data, error } = await supabase
      .from("projects")
      .insert({ ...baseRow, location: parsed.location })
      .select("id, status, created_at")
      .single();

    if (error && isMissingColumnError(error)) {
      ({ data, error } = await supabase
        .from("projects")
        .insert(baseRow)
        .select("id, status, created_at")
        .single());
    }

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
