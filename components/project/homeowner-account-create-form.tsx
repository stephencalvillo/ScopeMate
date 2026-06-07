"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isGoogleAuthEnabled } from "@/lib/clerk/google-auth-enabled";

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

export function HomeownerAccountCreateForm({
  onComplete,
}: {
  projectId: string;
  onComplete?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = fetchStatus === "idle" && signUp;

  async function activateSession() {
    if (!signUp) {
      throw new Error("Sign-up is not ready yet. Refresh and try again.");
    }

    if (signUp.status !== "complete") {
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        throw sendError;
      }
      setPendingVerification(true);
      return;
    }

    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) {
      throw finalizeError;
    }

    await onComplete?.();
    router.refresh();
  }

  async function handleCreateAccount(event: React.FormEvent) {
    event.preventDefault();
    if (!isReady) return;

    setLoading(true);
    setError(null);

    try {
      const { error: passwordError } = await signUp.password({
        emailAddress: email.trim(),
        password,
      });
      if (passwordError) {
        throw passwordError;
      }

      await activateSession();
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

      await activateSession();
    } catch (verifyError) {
      setError(clerkErrorMessage(verifyError));
    } finally {
      setLoading(false);
    }
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading secure sign-up...
      </div>
    );
  }

  if (pendingVerification) {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Check your email for a verification code sent to {email.trim()}.
        </p>
        <div className="space-y-2">
          <Label htmlFor="homeowner_verification_code">Verification code</Label>
          <Input
            id="homeowner_verification_code"
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
          disabled={loading || !verificationCode.trim()}
        >
          {loading ? "Verifying..." : "Verify and create account"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCreateAccount} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="homeowner_email">Email</Label>
        <Input
          id="homeowner_email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="homeowner_password">Password</Label>
        <Input
          id="homeowner_password"
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
        <p className="text-xs text-[var(--muted)]">
          Google sign-in is temporarily unavailable. Use email and password
          below.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !email.trim() || password.length < 8}
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
