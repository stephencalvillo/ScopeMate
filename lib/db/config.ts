export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const hasValidUrl =
    url.length > 0 && !url.includes("xxxx.supabase.co");
  const hasValidKey =
    key.length > 0 &&
    key !== "eyJ..." &&
    (key.startsWith("sb_secret_") || key.startsWith("eyJ"));

  return hasValidUrl && hasValidKey;
}

export function getSupabaseConfigError(): string | null {
  if (isSupabaseConfigured()) return null;

  return "ScopeMate cannot reach the database yet. Supabase still needs to be connected.";
}
