"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error.message.toLowerCase();
  const isDatabaseError =
    message.includes("supabase") ||
    message.includes("fetch failed") ||
    message.includes("enotfound");
  const needsEmailVerification =
    message.includes("verify your email") ||
    message.includes("email address");
  const duplicateEmail = message.includes("already exists");

  return (
    <div className="mx-auto max-w-xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>
            {isDatabaseError
              ? "Database not connected yet"
              : needsEmailVerification
                ? "Verify your email to continue"
                : duplicateEmail
                  ? "Account already exists"
                  : "Something went wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[var(--muted)]">
          {isDatabaseError ? (
            <p>
              You signed in successfully, but ScopeBuddy still needs Supabase to
              store your projects. This is a setup step, not a problem with
              your account.
            </p>
          ) : needsEmailVerification ? (
            <p>{error.message}</p>
          ) : duplicateEmail ? (
            <p>{error.message}</p>
          ) : (
            <p>We hit an unexpected error loading your projects.</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={reset}>Try again</Button>
            {duplicateEmail ? (
              <Button variant="outline" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/sign-in">Back to sign in</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
