"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SharedPhoto } from "@/lib/phase2/client";

export function PhotoLightbox({
  photos,
  initialIndex,
  open,
  onClose,
  onRemovePhoto,
  removingPhotoId = null,
}: {
  photos: SharedPhoto[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  onRemovePhoto?: (photo: SharedPhoto) => void;
  removingPhotoId?: string | null;
}) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const goPrev = useCallback(() => {
    setIndex((current) => (current > 0 ? current - 1 : photos.length - 1));
  }, [photos.length]);

  const goNext = useCallback(() => {
    setIndex((current) => (current < photos.length - 1 ? current + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, goPrev, goNext]);

  if (!open || photos.length === 0) return null;

  const photo = photos[index];
  const isRemoving = removingPhotoId === photo.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {photos.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-16 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}

      <div className="flex max-h-[85vh] max-w-[90vw] flex-col items-center gap-4 px-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.file_name}
          className="max-h-[75vh] max-w-full rounded-lg object-contain"
        />
        {photos.length > 1 ? (
          <p className="text-sm text-white/70">
            {index + 1} of {photos.length}
          </p>
        ) : null}
        {onRemovePhoto ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={Boolean(removingPhotoId)}
            onClick={() => onRemovePhoto(photo)}
          >
            {isRemoving ? "Removing..." : "Remove photo"}
          </Button>
        ) : null}
      </div>

      <button
        type="button"
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close photo viewer"
      />
    </div>
  );
}

export function SharedPhotoGallery({ photos }: { photos: SharedPhoto[] }) {
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <PageSection
        title="Project photos"
        description="Photos of the project area shared by the homeowner."
      >
        {photos.length === 0 ? (
          <SectionSurface>
            <p className="text-sm text-[var(--muted)]">
              No photos were shared for this project.
            </p>
          </SectionSurface>
        ) : (
          <SectionSurface>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                  className={cn(
                    "aspect-square overflow-hidden rounded-[8px] border border-[var(--border)] bg-neutral-100",
                    "transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.file_name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </SectionSurface>
        )}
      </PageSection>

      <PhotoLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
