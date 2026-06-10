import { SignUp } from "@clerk/nextjs";
import { ClerkCaptcha } from "@/components/auth/clerk-captcha";
import { getClerkAppearance } from "@/lib/clerk/appearance";

export function AuthSignUpForm({ redirectUrl }: { redirectUrl: string }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <ClerkCaptcha />
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={{
          ...getClerkAppearance(),
          captcha: {
            theme: "light",
            size: "flexible",
          },
        }}
        fallbackRedirectUrl={redirectUrl}
        forceRedirectUrl={redirectUrl}
      />
    </div>
  );
}
