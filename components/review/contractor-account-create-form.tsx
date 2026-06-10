"use client";

import { useState, type ReactNode } from "react";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { ClerkCaptcha } from "@/components/auth/clerk-captcha";
import { waitForClerkSession } from "@/lib/auth/clerk-session-ready";
import { finishContractorAccountSetup } from "@/lib/contractor/complete-signup";
import { readShareLinkReturn } from "@/lib/contractor/share-link-onboarding";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isGoogleAuthEnabled } from "@/lib/clerk/google-auth-enabled";
import { persistContractorSignupPrefill } from "@/lib/contractor/signup-prefill";

type SignupPrefill = {
  email?: string;
  contactName?: string;
  companyName?: string;
};

function clerkErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors: unknown }).errors)
  ) {
    const first = (
      error as { errors: Array<{ longMessage?: string; message?: string }> }
    ).errors[0];
    return first?.longMessage ?? first?.message ?? "Could not create account.";
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Could not create account.";
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function ContractorAccountCreateForm({
  prefill,
  emailEditable = true,
  onComplete,
}: {
  prefill?: SignupPrefill;
  emailEditable?: boolean;
  onComplete?: () => void;
}) {
  const { getToken } = useAuth();
  const { signUp, fetchStatus } = useSignUp();
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = Boolean(signUp);

  function persistPrefill() {
    persistContractorSignupPrefill({
      companyName: prefill?.companyName ?? "",
      contactName: prefill?.contactName ?? "",
      email: email.trim(),
    });
  }

  async function navigateAfterSignup() {
    onComplete?.();
    await waitForClerkSession(getToken);

    const shareReturn = readShareLinkReturn();
    if (shareReturn?.startsWith("/review/")) {
      try {
        await finishContractorAccountSetup(getToken);
      } catch {
        // Review page will retry setup and claim after redirect.
      }

      try {
        const reviewToken = shareReturn.replace("/review/", "");
        await authenticatedFetch(getToken, `/api/review/${reviewToken}/claim`, {
          method: "POST",
        });
      } catch {
        // Review page will retry claim after redirect.
      }

      window.location.assign(shareReturn);
      return;
    }

    window.location.assign("/contractor/complete-setup");
  }

  async function completeSignup() {
    if (!signUp) return;

    if (signUp.status === "complete") {
      const { error: finalizeError } = await signUp.finalize({
        navigate: async () => {
          await navigateAfterSignup();
        },
      });
      if (finalizeError) {
        throw finalizeError;
      }
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      throw sendError;
    }
    setPendingVerification(true);
  }

  async function handleCreateAccount(event: React.FormEvent) {
    event.preventDefault();
    if (!isReady) return;

    setLoading(true);
    setError(null);

    try {
      persistPrefill();

      const { error: passwordError } = await signUp.password({
        emailAddress: email.trim(),
        password,
      });
      if (passwordError) {
        throw passwordError;
      }

      await completeSignup();
    } catch (submitError) {
      setError(clerkErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(event: React.FormEvent) {
    event.preventDefault();
    if (!isReady) return;

    setLoading(true);
    setError(null);

    try {
      const { error: verifyError } =
        await signUp.verifications.verifyEmailCode({
          code: verificationCode.trim(),
        });
      if (verifyError) {
        throw verifyError;
      }

      await completeSignup();
    } catch (verifyError) {
      setError(clerkErrorMessage(verifyError));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!isReady) return;

    setLoading(true);
    setError(null);

    try {
      persistPrefill();

      const origin = window.location.origin;
      const { error: ssoError } = await signUp.sso({
        strategy: "oauth_google",
        redirectUrl: `${origin}/contractor/complete-setup`,
        redirectCallbackUrl: `${origin}/sign-up`,
      });
      if (ssoError) {
        throw ssoError;
      }
    } catch (oauthError) {
      setError(clerkErrorMessage(oauthError));
      setLoading(false);
    }
  }

  const isInitializing = fetchStatus === "fetching" && !signUp;

  let content: ReactNode;

  if (isInitializing) {
    content = (
      <p className="text-sm text-[var(--muted)]">Preparing sign up...</p>
    );
  } else if (fetchStatus === "idle" && !signUp) {
    content = (
      <p className="text-sm text-red-600">
        Sign up is unavailable right now. Please try again or use sign in with
        Google.
      </p>
    );
  } else if (pendingVerification) {
    content = (
      <form onSubmit={handleVerifyCode} className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Enter the verification code sent to {email.trim()}.
        </p>
        <div className="space-y-2">
          <Label htmlFor="verification_code">Verification code</Label>
          <Input
            id="verification_code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
            placeholder="123456"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button
          type="submit"
          className="w-full"
          disabled={
            loading || fetchStatus === "fetching" || !verificationCode.trim()
          }
        >
          {loading || fetchStatus === "fetching"
            ? "Verifying..."
            : "Verify and create account"}
        </Button>
      </form>
    );
  } else {
    content = (
      <form onSubmit={handleCreateAccount} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contractor_email">Email</Label>
          <Input
            id="contractor_email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            disabled={!emailEditable}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractor_password">Password</Label>
          <Input
            id="contractor_password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            required
            minLength={8}
          />
        </div>

        {isGoogleAuthEnabled() ? (
          <>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wide">
                <span className="bg-white px-2 text-[var(--muted)]">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={() => void handleGoogleSignIn()}
            >
              <GoogleIcon />
              Sign in with Google
            </Button>
          </>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <ClerkCaptcha />

        <Button
          type="submit"
          className="w-full"
          disabled={
            loading || fetchStatus === "fetching" || !email.trim() || password.length < 8
          }
        >
          {loading || fetchStatus === "fetching"
            ? "Creating account..."
            : "Create account"}
        </Button>
      </form>
    );
  }

  return content;
}
