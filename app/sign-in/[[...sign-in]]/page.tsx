import { SignIn } from "@clerk/nextjs";
import { AuthClerkForm } from "@/components/auth/auth-clerk-form";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { getClerkAppearance } from "@/lib/clerk/appearance";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url: redirectUrl } = await searchParams;
  const safeRedirect =
    redirectUrl?.startsWith("/") && !redirectUrl.startsWith("//")
      ? redirectUrl
      : "/projects";

  return (
    <AuthPageLayout>
      <AuthClerkForm>
        <SignIn
          appearance={getClerkAppearance()}
          fallbackRedirectUrl={safeRedirect}
          forceRedirectUrl={safeRedirect}
        />
      </AuthClerkForm>
    </AuthPageLayout>
  );
}
