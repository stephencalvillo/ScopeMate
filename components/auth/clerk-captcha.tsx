/**
 * Clerk mounts Cloudflare Turnstile onto this element during sign-up.
 * Without it, Clerk falls back to an invisible widget that can fail with
 * Turnstile error 300010 and leave sign-up stuck loading.
 */
export function ClerkCaptcha() {
  return (
    <div
      id="clerk-captcha"
      className="flex min-h-[65px] w-full items-center justify-center [&:empty]:min-h-0 [&:empty]:hidden"
      data-cl-theme="light"
      data-cl-size="flexible"
      data-cl-language="auto"
    />
  );
}
