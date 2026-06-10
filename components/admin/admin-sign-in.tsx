import { SignIn } from "@clerk/nextjs";
import { AuthClerkForm } from "@/components/auth/auth-clerk-form";
import { getClerkAppearance } from "@/lib/clerk/appearance";

export function AdminSignIn() {
  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
          ScopeBuddy Admin
        </p>
        <h1 className="font-display text-3xl tracking-tight text-neutral-900">
          Admin panel
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Sign in with an authorized admin account to continue.
        </p>
      </div>

      <AuthClerkForm>
        <SignIn
          appearance={getClerkAppearance()}
          fallbackRedirectUrl="/adminpanel"
          forceRedirectUrl="/adminpanel"
        />
      </AuthClerkForm>
    </div>
  );
}
