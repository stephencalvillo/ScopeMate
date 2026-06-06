export function isMissingTableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "PGRST205"
  );
}

export function isMissingColumnError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const code = "code" in error ? (error as { code: string }).code : "";
  const message =
    "message" in error ? String((error as { message: string }).message) : "";

  return (
    code === "PGRST204" ||
    message.includes("Could not find") ||
    message.includes("does not exist")
  );
}
