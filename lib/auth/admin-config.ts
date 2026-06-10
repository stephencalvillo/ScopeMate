function parseAllowlist(value: string | undefined) {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails() {
  return parseAllowlist(process.env.ADMIN_EMAILS);
}

export function getAdminUserIds() {
  return parseAllowlist(process.env.ADMIN_USER_IDS);
}

export function isAdminConfigured() {
  return getAdminEmails().length > 0 || getAdminUserIds().length > 0;
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export function isAdminUserId(userId: string | null | undefined) {
  if (!userId) return false;
  return getAdminUserIds().includes(userId.toLowerCase());
}

export function hasClerkAdminMetadata(
  publicMetadata: Record<string, unknown> | null | undefined
) {
  return publicMetadata?.role === "admin";
}
