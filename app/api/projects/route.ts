import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { createServiceClient } from "@/lib/db/supabase";
import { isMissingColumnError } from "@/lib/db/errors";
import { listProjectsForUser } from "@/lib/db/projects";
import { parseLocation } from "@/lib/location/parse";
import { lookupCityStateFromZip } from "@/lib/location/zip-lookup";
import { saveProjectTimelineAnswer } from "@/lib/follow-up/timeline";
import { resolveProjectTitle } from "@/lib/projects/title";
import { createProjectSchema } from "@/lib/validators/project";

export async function GET(request: Request) {
  try {
    const user = await ensureUserRecord(request);
    const projects = await listProjectsForUser(user.id);
    return NextResponse.json(projects);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await ensureUserRecord(request);
    const body = await request.json();
    const input = createProjectSchema.parse(body);
    const parsed = parseLocation(input.zip);
    let city = parsed.city || parsed.location;

    if (!parsed.city && parsed.zip) {
      const cityState = await lookupCityStateFromZip(parsed.zip);
      if (cityState) {
        city = cityState;
      }
    }

    const supabase = createServiceClient();
    const title = await resolveProjectTitle(
      input.original_description,
      input.title
    );

    const baseRow = {
      homeowner_id: user.id,
      title,
      project_type: "unspecified",
      city,
      zip: parsed.zip || input.zip,
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
    if (!data) {
      throw new Error("Could not create project.");
    }

    if (input.target_start) {
      try {
        await saveProjectTimelineAnswer(data.id, input.target_start);
      } catch (timelineError) {
        console.error("Failed to save timeline answer:", timelineError);
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
