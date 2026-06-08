export function formatShareLinkHomeownerName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "A homeowner";
  if (!trimmed.includes("@")) return trimmed;

  const localPart = trimmed.split("@")[0] ?? trimmed;
  const withoutTag = localPart.split("+")[0] ?? localPart;
  const words = withoutTag.replace(/[._-]+/g, " ").trim();

  if (!words) return "A homeowner";

  return words
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
