"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

export function HomeownerReviewRedirect({ token }: { token: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (searchParams.get("as") === "contractor") return;
    if (!isLoaded) return;

    void (async () => {
      const response = await fetch(`/api/review/${token}/homeowner-redirect`);
      if (!response.ok) return;

      const data = (await response.json()) as { redirect?: string | null };
      if (data.redirect) {
        router.replace(data.redirect);
      }
    })();
  }, [isLoaded, isSignedIn, router, searchParams, token]);

  return null;
}
