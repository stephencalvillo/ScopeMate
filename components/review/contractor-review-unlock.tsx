"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionSurface } from "@/components/layout/page-section";

export function ContractorReviewUnlock({
  token,
  onUnlocked,
}: {
  token: string;
  onUnlocked: () => void;
}) {
  const [contractorEmail, setContractorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/review/${token}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractor_email: contractorEmail }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not verify email.");
      return;
    }

    onUnlocked();
  }

  return (
    <SectionSurface className="space-y-4 border-amber-200 bg-amber-50/80">
      <div className="space-y-1">
        <h2 className="font-display text-xl tracking-tight text-neutral-900">
          View-only access
        </h2>
        <p className="text-sm text-[var(--muted)]">
          You can review this scope, but only the invited contractor can edit the
          quote from their browser. Contractors can verify the email on this
          invitation to unlock editing here.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="unlock-email">Contractor email</Label>
          <Input
            id="unlock-email"
            type="email"
            value={contractorEmail}
            onChange={(event) => setContractorEmail(event.target.value)}
            placeholder="name@example.com"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Unlock editing"}
        </Button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </SectionSurface>
  );
}
