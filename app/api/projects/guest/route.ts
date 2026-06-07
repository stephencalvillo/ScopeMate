import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import {
  generateGuestAccessToken,
  setGuestProjectCookie,
} from "@/lib/auth/guest-project";
import { createServiceClient } from "@/lib/db/supabase";
import { isMissingColumnError } from "@/lib/db/errors";
import { parseLocation } from "@/lib/location/parse";
import { lookupCityStateFromZip } from "@/lib/location/zip-lookup";
import { resolveProjectTitle } from "@/lib/projects/title";
import { createGuestProjectSchema } from "@/lib/validators/project";

function isGuestProjectSetupError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const message =
    "message" in error ? String((error as { message: string }).message) : "";

  return (
    message.includes("guest_access_token") ||
    message.includes('null value in column "homeowner_id"') ||
    message.includes("violates not-null constraint")
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createGuestProjectSchema.parse(body);
    const guestAccessToken = generateGuestAccessToken();
    const title = await resolveProjectTitle(input.original_description);
    const parsed = parseLocation(input.zip);
    let city = parsed.city || parsed.location;

    if (!parsed.city && parsed.zip) {
      const cityState = await lookupCityStateFromZip(parsed.zip);
      if (cityState) {
        city = cityState;
      }
    }

    const supabase = createServiceClient();

    const baseRow = {
      homeowner_id: null,
      guest_access_token: guestAccessToken,
      title,
      project_type: "unspecified",
      city,
      zip: parsed.zip || input.zip,
      location: parsed.location,
      original_description: input.original_description,
      status: "draft" as const,
    };

    let { data, error } = await supabase
      .from("projects")
      .insert(baseRow)
      .select("id, status, created_at")
      .single();

    if (error && isMissingColumnError(error)) {
      throw new Error(
        "Guest projects require migration 015_guest_projects.sql."
      );
    }

    if (error && isGuestProjectSetupError(error)) {
      throw new Error(
        "Guest projects are not set up yet. Run migration 015_guest_projects.sql."
      );
    }

    if (error) throw error;
    if (!data) {
      throw new Error("Could not create guest project.");
    }

    const response = NextResponse.json(data, { status: 201 });
    setGuestProjectCookie(response, data.id, guestAccessToken);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
