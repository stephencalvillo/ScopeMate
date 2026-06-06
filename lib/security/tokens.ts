import { randomBytes } from "crypto";

const DEFAULT_BYTES = 24;

export function generateShareToken(): string {
  const bytes = Number(process.env.SHARE_TOKEN_BYTES ?? DEFAULT_BYTES);
  return randomBytes(bytes).toString("base64url");
}
