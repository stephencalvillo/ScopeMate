import { SignIn } from "@clerk/nextjs";
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-[var(--page-padding-x)]">
      <div className="mb-10 max-w-md text-center">
        <p className="font-display text-4xl tracking-tight text-neutral-900 text-balance">
          Helping homeowners and contractors start on the same page.
        </p>
      </div>
      <SignIn
        appearance={getClerkAppearance()}
        fallbackRedirectUrl={safeRedirect}
        forceRedirectUrl={safeRedirect}
      />
    </div>
  );
}
