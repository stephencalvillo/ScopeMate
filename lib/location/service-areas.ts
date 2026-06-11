/** Canonical metro labels for contractor service areas and future homeowner matching. */
export const SERVICE_AREAS = [
  "Albuquerque, NM",
  "Anchorage, AK",
  "Atlanta, GA",
  "Austin, TX",
  "Bakersfield, CA",
  "Baltimore, MD",
  "Baton Rouge, LA",
  "Birmingham, AL",
  "Boise, ID",
  "Boston, MA",
  "Buffalo, NY",
  "Charleston, SC",
  "Charlotte, NC",
  "Chicago, IL",
  "Cincinnati, OH",
  "Cleveland, OH",
  "Colorado Springs, CO",
  "Columbus, OH",
  "Corpus Christi, TX",
  "Dallas, TX",
  "Denver, CO",
  "Des Moines, IA",
  "Detroit, MI",
  "Durham, NC",
  "El Paso, TX",
  "Fort Lauderdale, FL",
  "Fort Worth, TX",
  "Fresno, CA",
  "Grand Rapids, MI",
  "Greensboro, NC",
  "Hartford, CT",
  "Honolulu, HI",
  "Houston, TX",
  "Indianapolis, IN",
  "Jacksonville, FL",
  "Kansas City, MO",
  "Knoxville, TN",
  "Las Vegas, NV",
  "Lexington, KY",
  "Little Rock, AR",
  "Long Beach, CA",
  "Los Angeles, CA",
  "Louisville, KY",
  "Madison, WI",
  "Memphis, TN",
  "Miami, FL",
  "Milwaukee, WI",
  "Minneapolis, MN",
  "Nashville, TN",
  "New Orleans, LA",
  "New York, NY",
  "Oakland, CA",
  "Oklahoma City, OK",
  "Omaha, NE",
  "Orlando, FL",
  "Philadelphia, PA",
  "Phoenix, AZ",
  "Pittsburgh, PA",
  "Portland, OR",
  "Providence, RI",
  "Raleigh, NC",
  "Richmond, VA",
  "Riverside, CA",
  "Rochester, NY",
  "Sacramento, CA",
  "Salt Lake City, UT",
  "San Antonio, TX",
  "San Diego, CA",
  "San Francisco, CA",
  "San Jose, CA",
  "Santa Ana, CA",
  "Seattle, WA",
  "Spokane, WA",
  "St. Louis, MO",
  "St. Paul, MN",
  "Stockton, CA",
  "Tampa, FL",
  "Toledo, OH",
  "Tucson, AZ",
  "Tulsa, OK",
  "Virginia Beach, VA",
  "Washington, DC",
  "Wichita, KS",
] as const;

export type ServiceAreaLabel = (typeof SERVICE_AREAS)[number];

const SERVICE_AREA_LOOKUP = new Map(
  SERVICE_AREAS.map((area) => [area.toLowerCase(), area])
);

function normalizeQuery(query: string) {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeServiceArea(value: string): ServiceAreaLabel | null {
  const normalized = normalizeQuery(value);
  if (!normalized) return null;
  return SERVICE_AREA_LOOKUP.get(normalized) ?? null;
}

export function searchServiceAreas(query: string, limit = 8): ServiceAreaLabel[] {
  const normalized = normalizeQuery(query);

  if (!normalized) {
    return SERVICE_AREAS.slice(0, limit);
  }

  const tokens = normalized.split(/[\s,]+/).filter(Boolean);

  return SERVICE_AREAS.filter((area) => {
    const haystack = area.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  }).slice(0, limit);
}

export function isKnownServiceArea(value: string): boolean {
  return normalizeServiceArea(value) !== null;
}
