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
  const isDatabaseError =
    error.message.includes("supabase") ||
    error.message.includes("fetch failed") ||
    error.message.includes("ENOTFOUND");

  return (
    <div className="mx-auto max-w-xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>
            {isDatabaseError
              ? "Database not connected yet"
              : "Something went wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[var(--muted)]">
          {isDatabaseError ? (
            <p>
              You signed in successfully, but ScopeMate still needs Supabase to
              store your projects. This is a setup step, not a problem with
              your account.
            </p>
          ) : (
            <p>We hit an unexpected error loading your projects.</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" asChild>
              <Link href="/sign-in">Back to sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
