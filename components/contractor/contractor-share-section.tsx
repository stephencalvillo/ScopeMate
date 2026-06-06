"use client";

import { useState } from "react";
import { ContractorInviteForm } from "@/components/contractor/contractor-invite-form";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { ShareLinkDialog } from "@/components/project/share-link-dialog-content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/types";

export function ContractorShareSection({
  project,
  onActivityChange,
}: {
  project: Project;
  onActivityChange?: () => void;
}) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function notifyActivityChange() {
    onActivityChange?.();
  }

  return (
    <>
      <PageSection
        title="Share with a contractor"
        description="Send a read-only link or email invitation so a contractor can review your scope."
      >
        <SectionSurface className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setShareDialogOpen(true)}>
              Create share link
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setInviteDialogOpen(true)}
            >
              Send invitation
            </Button>
          </div>

          {message ? (
            <p className="text-sm text-[var(--muted)]">{message}</p>
          ) : null}
        </SectionSurface>
      </PageSection>

      <ShareLinkDialog
        project={project}
        open={shareDialogOpen}
        autoCreate
        onOpenChange={(open) => {
          setShareDialogOpen(open);
          if (!open) notifyActivityChange();
        }}
      />

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader className="mb-0">
            <DialogTitle>Send invitation</DialogTitle>
            <p className="text-sm text-[var(--muted)]">
              The contractor will receive an email with a link to review your scope
              and suggest improvements.
            </p>
          </DialogHeader>
          <ContractorInviteForm
            projectId={project.id}
            onCreated={() => {
              setMessage(
                "Invitation sent. The contractor will receive an email shortly."
              );
              setInviteDialogOpen(false);
              notifyActivityChange();
            }}
            onError={(error) => setMessage(error)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
