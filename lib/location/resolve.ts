import { createServiceClient } from "@/lib/db/supabase";
import { isMissingColumnError } from "@/lib/db/errors";
import {
  formatProjectLocation,
  parseLocation,
  ZIP_PATTERN,
} from "@/lib/location/parse";
import { lookupCityStateFromZip } from "@/lib/location/zip-lookup";
import type { Project } from "@/types";

function isZipOnly(value: string): boolean {
  return ZIP_PATTERN.test(value.trim()) && value.trim().replace(ZIP_PATTERN, "").trim() === "";
}

export function getProjectZip(project: {
  location?: string | null;
  city: string;
  zip: string;
}): string | null {
  const zip = project.zip?.trim();
  if (zip && zip !== "N/A") {
    const match = zip.match(ZIP_PATTERN);
    if (match) return match[1];
  }

  const raw = project.location?.trim() || project.city?.trim() || "";
  const parsed = parseLocation(raw);
  return parsed.zip || null;
}

export function projectNeedsLocationLookup(project: {
  location?: string | null;
  city: string;
  zip: string;
}): boolean {
  if (formatProjectLocation(project) !== "Location not specified") {
    return false;
  }

  return getProjectZip(project) !== null;
}

export async function enrichProjectLocation<T extends Project>(
  project: T,
  options?: { persist?: boolean }
): Promise<T> {
  if (!projectNeedsLocationLookup(project)) {
    return project;
  }

  const zip = getProjectZip(project);
  if (!zip) return project;

  const cityState = await lookupCityStateFromZip(zip);
  if (!cityState) return project;

  if (options?.persist) {
    const supabase = createServiceClient();

    const { error: updateError } = await supabase
      .from("projects")
      .update({ city: cityState })
      .eq("id", project.id);

    if (updateError && !isMissingColumnError(updateError)) {
      throw updateError;
    }
  }

  return {
    ...project,
    city: cityState,
    location: project.location?.trim() || cityState,
  };
}

export async function enrichProjectsLocation(projects: Project[]): Promise<Project[]> {
  return Promise.all(
    projects.map((project) => enrichProjectLocation(project, { persist: true }))
  );
}

export async function formatProjectLocationResolved(project: {
  id?: string;
  location?: string | null;
  city: string;
  zip: string;
}): Promise<string> {
  const enriched = project.id
    ? await enrichProjectLocation(project as Project, { persist: true })
    : project;

  if (projectNeedsLocationLookup(enriched as Project)) {
    const zip = getProjectZip(enriched);
    if (zip) {
      const cityState = await lookupCityStateFromZip(zip);
      if (cityState) return cityState;
    }
  }

  return formatProjectLocation(enriched);
}

export { isZipOnly };
