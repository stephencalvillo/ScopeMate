export const PHOTOS_BUCKET =
  process.env.SUPABASE_PROJECT_PHOTOS_BUCKET ?? "project-photos";

export const MAX_PHOTOS_PER_PROJECT = Number(
  process.env.MAX_PHOTOS_PER_PROJECT ?? 10
);

export const MAX_PHOTO_BYTES = Number(
  process.env.MAX_PHOTO_BYTES ?? 10 * 1024 * 1024
);

export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const FOLLOW_UP_PROMPT_VERSION =
  process.env.FOLLOW_UP_PROMPT_VERSION ?? "follow-up-v1";

export const MAX_FOLLOW_UP_QUESTIONS = Number(
  process.env.MAX_FOLLOW_UP_QUESTIONS ?? 3
);

export const SIGNED_URL_EXPIRY_SECONDS = 3600;
