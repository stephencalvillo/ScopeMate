"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isShareLinkPlaceholder,
  SHARE_LINK_PLACEHOLDER_NAME,
} from "@/lib/contractor/project-share";
import { SectionSurface } from "@/components/layout/page-section";
import type { ContractorInvitation } from "@/types";

export function ContractorIdentityGate({
  token,
  invitation,
  onComplete,
}: {
  token: string;
  invitation: ContractorInvitation;
  onComplete: () => void;
}) {
  const isShareLink = isShareLinkPlaceholder(invitation);
  const needsName =
    isShareLink || invitation.contractor_name === SHARE_LINK_PLACEHOLDER_NAME;
  const [contractorName, setContractorName] = useState(
    needsName ? "" : invitation.contractor_name
  );
  const [contractorEmail, setContractorEmail] = useState(
    isShareLink ? "" : invitation.contractor_email
  );
  const [contractorCompany, setContractorCompany] = useState(
    invitation.contractor_company ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/review/${token}/identity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractor_name: contractorName,
        contractor_email: contractorEmail,
        contractor_company: contractorCompany || undefined,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not continue to review.");
      return;
    }

    onComplete();
  }

  return (
    <SectionSurface className="mx-auto max-w-lg space-y-4">
      <div className="space-y-1">
        <h1 className="font-display text-3xl tracking-tight text-neutral-900">
          Confirm your details
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Before reviewing the project scope, confirm how we should show your name
          to the homeowner.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="review-name">Your name</Label>
          <Input
            id="review-name"
            value={contractorName}
            onChange={(event) => setContractorName(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-email">Email</Label>
          <Input
            id="review-email"
            type="email"
            value={contractorEmail}
            onChange={(event) => setContractorEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-company">Company (optional)</Label>
          <Input
            id="review-company"
            value={contractorCompany}
            onChange={(event) => setContractorCompany(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Continue to review"}
        </Button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </SectionSurface>
  );
}
