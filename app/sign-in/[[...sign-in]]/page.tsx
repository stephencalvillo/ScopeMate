import { AuthClerkForm } from "@/components/auth/auth-clerk-form";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { AuthSignInForm } from "@/components/auth/auth-sign-in-form";
import { normalizeAuthRedirectUrl } from "@/lib/auth/normalize-redirect-url";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url: redirectUrl } = await searchParams;
  const safeRedirect = normalizeAuthRedirectUrl(redirectUrl);

  return (
    <AuthPageLayout>
      <AuthClerkForm>
        <AuthSignInForm redirectUrl={safeRedirect} />
      </AuthClerkForm>
    </AuthPageLayout>
  );
}
