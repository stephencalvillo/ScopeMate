"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ContractorInviteForm } from "@/components/contractor/contractor-invite-form";
import { ContractorInviteRow } from "@/components/contractor/contractor-invite-row";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import type { ContractorInvitationWithReview } from "@/types";

export function ContractorInviteSection({ projectId }: { projectId: string }) {
  const [invitations, setInvitations] = useState<ContractorInvitationWithReview[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/invitations`);
      const data = await response.json();
      if (response.ok) {
        setInvitations(data.invitations ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  return (
    <PageSection
      title="Invite a contractor"
      description="Send an email invitation so they can review your scope and suggest improvements. This is separate from your public share link."
    >
      <div className="space-y-4">
        <ContractorInviteForm
          projectId={projectId}
          onCreated={(invitation) => {
            setInvitations((current) => [invitation, ...current]);
            setMessage("Invitation sent. The contractor will receive an email shortly.");
          }}
          onError={(error) => setMessage(error)}
        />

        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading invitations
          </div>
        ) : invitations.length === 0 ? (
          <SectionSurface>
            <p className="text-sm text-[var(--muted)]">
              No invitations yet. Send one when you are ready for contractor feedback.
            </p>
          </SectionSurface>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <ContractorInviteRow
                key={invitation.id}
                projectId={projectId}
                invitation={invitation}
                onRevoked={() =>
                  setInvitations((current) =>
                    current.map((entry) =>
                      entry.id === invitation.id
                        ? { ...entry, status: "revoked" }
                        : entry
                    )
                  )
                }
                onResent={() =>
                  setMessage(`Invitation resent to ${invitation.contractor_email}.`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </PageSection>
  );
}
