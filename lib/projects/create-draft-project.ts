import { createServiceClient } from "@/lib/db/supabase";
import { isMissingColumnError } from "@/lib/db/errors";
import { parseLocation } from "@/lib/location/parse";
import { lookupCityStateFromZip } from "@/lib/location/zip-lookup";
import { saveProjectTimelineAnswer } from "@/lib/follow-up/timeline";
import { resolveProjectTitle } from "@/lib/projects/title";
import type { ProjectCreatorRole } from "@/types";

type CreateDraftProjectInput = {
  original_description: string;
  zip: string;
  target_start?: string;
  creator_role?: ProjectCreatorRole;
  created_by_user_id?: string | null;
  guest_access_token?: string | null;
};

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

export async function createDraftProject(input: CreateDraftProjectInput) {
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
  const creatorRole = input.creator_role ?? "homeowner";

  const baseRow = {
    homeowner_id: null,
    guest_access_token: input.guest_access_token ?? null,
    creator_role: creatorRole,
    created_by_user_id: input.created_by_user_id ?? null,
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
    const { creator_role: _creatorRole, ...withoutCreatorRole } = baseRow;
    ({ data, error } = await supabase
      .from("projects")
      .insert(withoutCreatorRole)
      .select("id, status, created_at")
      .single());
  }

  if (error && isMissingColumnError(error)) {
    const {
      creator_role: _creatorRole,
      created_by_user_id: _createdByUserId,
      ...legacyRow
    } = baseRow;
    ({ data, error } = await supabase
      .from("projects")
      .insert(legacyRow)
      .select("id, status, created_at")
      .single());
  }

  if (error && isMissingColumnError(error)) {
    throw new Error("Guest projects require migration 015_guest_projects.sql.");
  }

  if (error && isGuestProjectSetupError(error)) {
    throw new Error(
      "Guest projects are not set up yet. Run migration 015_guest_projects.sql."
    );
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

  return data;
}
