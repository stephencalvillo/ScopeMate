"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function LeaveCreationDraftDialog({
  open,
  onOpenChange,
  projectId,
  listHref,
  preview = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  listHref: string;
  preview?: boolean;
}) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goToProjects() {
    onOpenChange(false);
    router.push(listHref);
    router.refresh();
  }

  function handleSaveDraft() {
    goToProjects();
  }

  async function handleDiscard() {
    setLoading(true);
    setError(null);

    try {
      if (!preview) {
        const response = await authenticatedFetch(
          getToken,
          `/api/projects/${projectId}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response, "Could not discard this project.")
          );
        }
      }

      goToProjects();
    } catch (discardError) {
      setError(
        discardError instanceof Error
          ? discardError.message
          : "Could not discard this project."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (loading) return;
        if (!nextOpen) setError(null);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save this as a draft?</DialogTitle>
          <DialogDescription>
            You can come back and finish it from Your projects anytime.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            className="text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => void handleDiscard()}
            disabled={loading}
          >
            {loading ? "Discarding..." : "Discard project"}
          </Button>
          <Button type="button" onClick={handleSaveDraft} disabled={loading}>
            Save draft
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
