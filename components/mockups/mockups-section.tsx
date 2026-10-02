"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, X } from "lucide-react";
import { PhotoLightbox } from "@/components/share/shared-photo-gallery";
import { MockupStudioDialog } from "@/components/mockups/mockup-studio-dialog";
import { Button } from "@/components/ui/button";
import {
  deleteMockup,
  fetchMockups,
  type ProjectMockupWithUrl,
} from "@/lib/mockups/client";
import { cn } from "@/lib/utils";

const DESCRIPTION =
  "Create realistic mock-ups of your project using inspiration images and screenshots.";

export function MockupsSection({
  projectId,
  layout = "sidebar",
  preview = false,
}: {
  projectId: string;
  layout?: "sidebar" | "embedded" | "section";
  preview?: boolean;
}) {
  const { getToken, isSignedIn } = useAuth();
  const [mockups, setMockups] = useState<ProjectMockupWithUrl[]>([]);
  const [studioOpen, setStudioOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const loadMockups = useCallback(async () => {
    if (preview) {
      setMockups([]);
      return;
    }

    try {
      const result = await fetchMockups(
        projectId,
        isSignedIn ? getToken : undefined
      );
      setMockups(result);
    } catch {
      setMockups([]);
    }
  }, [getToken, isSignedIn, preview, projectId]);

  useEffect(() => {
    void loadMockups();
  }, [loadMockups]);

  async function handleDelete(mockupId: string) {
    setDeletingId(mockupId);
    setError(null);
    try {
      if (!preview && !mockupId.startsWith("local-")) {
        await deleteMockup(
          projectId,
          mockupId,
          isSignedIn ? getToken : undefined
        );
      }
      const deletedIndex = mockups.findIndex((mockup) => mockup.id === mockupId);
      const next = mockups.filter((mockup) => mockup.id !== mockupId);
      setMockups(next);
      setPendingDeleteId(null);
      if (lightboxOpen) {
        if (next.length === 0) setLightboxOpen(false);
        else setLightboxIndex(Math.min(deletedIndex, next.length - 1));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove the mock-up."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const plus = (
    <button
      type="button"
      onClick={() => setStudioOpen(true)}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
      aria-label="Open mock-up studio"
    >
      <Plus className="h-4 w-4" aria-hidden />
    </button>
  );

  const gallery =
    mockups.length > 0 ? (
      <div
        className={cn(
          "grid gap-2",
          layout === "sidebar" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
        )}
      >
        {mockups.map((mockup, index) => (
          <div
            key={mockup.id}
            className="group relative aspect-[4/3] overflow-hidden rounded-[8px] bg-neutral-100"
          >
            <button
              type="button"
              onClick={() => {
                setLightboxIndex(index);
                setLightboxOpen(true);
              }}
              className="h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              aria-label={`View mock-up ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mockup.url}
                alt={mockup.prompt || "Project mock-up"}
                className="h-full w-full object-cover"
              />
            </button>
            {pendingDeleteId === mockup.id ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-950/75 p-2 text-center">
                <p className="text-xs font-medium text-white">Remove this mock-up?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={deletingId === mockup.id}
                    onClick={() => void handleDelete(mockup.id)}
                  >
                    {deletingId === mockup.id ? "Removing..." : "Remove"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={deletingId === mockup.id}
                    onClick={() => setPendingDeleteId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPendingDeleteId(mockup.id)}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-neutral-700 opacity-0 shadow-sm transition-opacity hover:bg-white hover:text-neutral-900 focus-visible:opacity-100 group-hover:opacity-100"
                aria-label="Remove mock-up"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        ))}
      </div>
    ) : null;

  return (
    <>
      {layout === "embedded" ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
              {DESCRIPTION}
            </p>
            {plus}
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {gallery}
        </div>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg text-neutral-900">Mockups</h2>
            {plus}
          </div>
          <p className="text-sm leading-6 text-[var(--muted)]">{DESCRIPTION}</p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {gallery}
        </section>
      )}

      <MockupStudioDialog
        projectId={projectId}
        open={studioOpen}
        preview={preview}
        onOpenChange={setStudioOpen}
        onSaved={() => {
          void loadMockups();
        }}
      />

      <PhotoLightbox
        photos={mockups.map((mockup) => ({
          id: mockup.id,
          file_name: mockup.file_name,
          url: mockup.url,
        }))}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onRemovePhoto={(photo) => void handleDelete(photo.id)}
        removingPhotoId={deletingId}
      />
    </>
  );
}
