const zipCache = new Map<string, string | null>();

export async function lookupCityStateFromZip(
  zip: string
): Promise<string | null> {
  const match = zip.trim().match(/^(\d{5})/);
  if (!match) return null;

  const normalized = match[1];
  if (zipCache.has(normalized)) {
    return zipCache.get(normalized) ?? null;
  }

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${normalized}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      zipCache.set(normalized, null);
      return null;
    }

    const data = (await response.json()) as {
      places?: Array<{
        "place name": string;
        "state abbreviation": string;
      }>;
    };

    const place = data.places?.[0];
    if (!place) {
      zipCache.set(normalized, null);
      return null;
    }

    const label = `${place["place name"]}, ${place["state abbreviation"]}`;
    zipCache.set(normalized, label);
    return label;
  } catch {
    zipCache.set(normalized, null);
    return null;
  }
}
