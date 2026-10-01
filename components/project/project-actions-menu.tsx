"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Archive, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function ProjectActionsMenu({
  projectId,
  listHref = "/projects",
  preview = false,
}: {
  projectId: string;
  listHref?: string;
  preview?: boolean;
}) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestProject(method: "PATCH" | "DELETE") {
    if (preview) {
      return;
    }

    const response = await authenticatedFetch(
      getToken,
      `/api/projects/${projectId}`,
      method === "PATCH"
        ? {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "archived" }),
          }
        : { method }
    );

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(
          response,
          method === "DELETE"
            ? "Could not delete this project."
            : "Could not archive this project."
        )
      );
    }
  }

  function returnToList() {
    router.push(listHref);
    router.refresh();
  }

  async function archiveProject() {
    setLoading(true);
    setError(null);

    try {
      await requestProject("PATCH");
      returnToList();
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : "Could not archive this project."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject() {
    setLoading(true);
    setError(null);

    try {
      await requestProject("DELETE");
      setDeleteOpen(false);
      returnToList();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this project."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-11 w-11 p-0"
              aria-label="Project options"
              disabled={loading}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                void archiveProject();
              }}
              disabled={loading}
            >
              <Archive className="h-4 w-4" />
              Archive project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onSelect={() => {
                setError(null);
                setTimeout(() => setDeleteOpen(true), 0);
              }}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {error && !deleteOpen ? (
          <p className="max-w-56 text-right text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this project?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--muted)]">
            This permanently removes the project and its scope. This cannot be
            undone.
          </p>
          {error ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => void deleteProject()}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
