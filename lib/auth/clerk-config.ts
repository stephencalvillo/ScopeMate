export function getClerkSecretKeyError(): string | null {
  const key = process.env.CLERK_SECRET_KEY?.trim() ?? "";

  if (!key || key === "sk_test_..." || key === "sk_live_...") {
    return "CLERK_SECRET_KEY is missing. Add it in Vercel production environment variables and redeploy.";
  }

  if (!key.startsWith("sk_test_") && !key.startsWith("sk_live_")) {
    return "CLERK_SECRET_KEY looks invalid. Copy the secret key from Clerk Dashboard → API Keys.";
  }

  return null;
}
