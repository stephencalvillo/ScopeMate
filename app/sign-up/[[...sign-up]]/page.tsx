import { SignUp } from "@clerk/nextjs";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { getClerkAppearance } from "@/lib/clerk/appearance";

export default function SignUpPage() {
  return (
    <AuthPageLayout>
      <SignUp appearance={getClerkAppearance()} />
    </AuthPageLayout>
  );
}
