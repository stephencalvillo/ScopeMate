import { SignIn } from "@clerk/nextjs";
import { AuthClerkForm } from "@/components/auth/auth-clerk-form";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { AuthSignInForm } from "@/components/auth/auth-sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url: redirectUrl } = await searchParams;
  const safeRedirect =
    redirectUrl?.startsWith("/") && !redirectUrl.startsWith("//")
      ? redirectUrl.split("?")[0] || "/projects"
      : "/projects";

  return (
    <AuthPageLayout>
      <AuthClerkForm>
        <AuthSignInForm redirectUrl={safeRedirect} />
      </AuthClerkForm>
    </AuthPageLayout>
  );
}
