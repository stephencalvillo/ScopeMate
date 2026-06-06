export interface ParsedLocation {
  location: string;
  city: string;
  zip: string;
}

const ZIP_PATTERN = /\b(\d{5})(?:-(\d{4}))?\b/;

export { ZIP_PATTERN };

function isZipOnly(value: string): boolean {
  return ZIP_PATTERN.test(value.trim()) && value.trim().replace(ZIP_PATTERN, "").trim() === "";
}

export function parseLocation(input: string): ParsedLocation {
  const location = input.trim().replace(/\s+/g, " ");
  const zipMatch = location.match(ZIP_PATTERN);

  if (!zipMatch) {
    return {
      location,
      city: location,
      zip: "",
    };
  }

  const zip = zipMatch[2] ? `${zipMatch[1]}-${zipMatch[2]}` : zipMatch[1];
  const city = location
    .replace(zipMatch[0], "")
    .replace(/[,.\s-]+$/g, "")
    .trim();

  return {
    location,
    city,
    zip,
  };
}

function stripZipFromLocation(value: string): string {
  return value.replace(ZIP_PATTERN, "").replace(/[,.\s-]+$/g, "").trim();
}

export function formatProjectLocation(project: {
  location?: string | null;
  city: string;
  zip: string;
}): string {
  const candidates = [
    project.location?.trim(),
    project.city?.trim(),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const withoutZip = stripZipFromLocation(candidate);
    if (withoutZip && !isZipOnly(withoutZip)) {
      return withoutZip;
    }
  }

  return "Location not specified";
}
