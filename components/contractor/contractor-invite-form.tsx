"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContractorInvitationWithReview } from "@/types";

export function ContractorInviteForm({
  projectId,
  onCreated,
  onError,
}: {
  projectId: string;
  onCreated: (invitation: ContractorInvitationWithReview) => void;
  onError: (message: string) => void;
}) {
  const [contractorName, setContractorName] = useState("");
  const [contractorEmail, setContractorEmail] = useState("");
  const [contractorCompany, setContractorCompany] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(`/api/projects/${projectId}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractor_name: contractorName,
        contractor_email: contractorEmail,
        contractor_company: contractorCompany || undefined,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      onError(data.error ?? "Could not send invitation.");
      return;
    }

    onCreated(data.invitation);
    setContractorName("");
    setContractorEmail("");
    setContractorCompany("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contractor-name">Contractor name</Label>
            <Input
              id="contractor-name"
              value={contractorName}
              onChange={(event) => setContractorName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractor-email">Email</Label>
            <Input
              id="contractor-email"
              type="email"
              value={contractorEmail}
              onChange={(event) => setContractorEmail(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contractor-company">Company (optional)</Label>
          <Input
            id="contractor-company"
            value={contractorCompany}
            onChange={(event) => setContractorCompany(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send invitation"}
        </Button>
      </form>
  );
}
