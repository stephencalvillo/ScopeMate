import { AuthClerkForm } from "@/components/auth/auth-clerk-form";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { AuthSignUpForm } from "@/components/auth/auth-sign-up-form";
import { normalizeAuthRedirectUrl } from "@/lib/auth/normalize-redirect-url";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url: redirectUrl } = await searchParams;
  const safeRedirect = normalizeAuthRedirectUrl(redirectUrl);

  return (
    <AuthPageLayout>
      <AuthClerkForm>
        <AuthSignUpForm redirectUrl={safeRedirect} />
      </AuthClerkForm>
    </AuthPageLayout>
  );
}
