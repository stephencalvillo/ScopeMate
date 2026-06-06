"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { PhotoLightbox } from "@/components/share/shared-photo-gallery";
import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deletePhoto,
  fetchPhotos,
  uploadPhoto,
  type ProjectPhotoWithUrl,
  type SharedPhoto,
} from "@/lib/phase2/client";

function PhotoDropZone({
  onFiles,
  uploading,
  compact = false,
  label,
  hint,
}: {
  onFiles: (files: FileList) => void;
  uploading: boolean;
  compact?: boolean;
  label: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function openPicker() {
    if (!uploading) inputRef.current?.click();
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    if (!uploading) setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    if (uploading || !event.dataTransfer.files.length) return;
    onFiles(event.dataTransfer.files);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) onFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-[8px] border border-dashed text-center transition-colors",
          compact ? "aspect-square px-3 py-4" : "px-6 py-10",
          isDragging
            ? "border-neutral-400 bg-neutral-100"
            : "border-[var(--border)] bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100/80",
          uploading ? "cursor-wait opacity-70" : "cursor-pointer"
        )}
      >
        {uploading ? (
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-neutral-400" />
        ) : (
          <ImagePlus className="mb-3 h-8 w-8 text-neutral-400" />
        )}
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{hint}</p>
      </button>
    </>
  );
}

function toSharedPhotos(photos: ProjectPhotoWithUrl[]): SharedPhoto[] {
  return photos.map((photo) => ({
    id: photo.id,
    file_name: photo.file_name,
    url: photo.url,
  }));
}

export function PhotoUploadSection({ projectId }: { projectId: string }) {
  const [photos, setPhotos] = useState<ProjectPhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const loadPhotos = useCallback(async () => {
    try {
      const result = await fetchPhotos(projectId);
      setPhotos(result);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  async function handleFiles(files: FileList) {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (imageFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of imageFiles) {
        const photo = await uploadPhoto(projectId, file);
        setPhotos((current) => [...current, photo]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not upload photo."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photoId: string) {
    setDeletingId(photoId);
    setError(null);

    try {
      await deletePhoto(projectId, photoId);
      setPhotos((current) => current.filter((p) => p.id !== photoId));
      setPendingDeleteId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete photo."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const sharedPhotos = toSharedPhotos(photos);

  return (
    <>
      <PageSection
        title="Project photos"
        description="Photos help contractors understand your space. No need for perfect angles."
      >
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading photos
          </div>
        ) : photos.length === 0 ? (
          <PhotoDropZone
            onFiles={handleFiles}
            uploading={uploading}
            label="No photos yet"
            hint="Click to browse or drag photos here"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo, index) => (
              <SectionSurface
                key={photo.id}
                className="group relative aspect-square overflow-hidden p-0"
              >
                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                  className="h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                  aria-label={`View ${photo.file_name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.file_name}
                    className="h-full w-full object-cover"
                  />
                </button>

                {pendingDeleteId === photo.id ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-950/75 p-3 text-center">
                    <p className="text-sm font-medium text-white">
                      Remove this photo?
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === photo.id}
                        onClick={() => handleDelete(photo.id)}
                      >
                        {deletingId === photo.id ? "Removing..." : "Remove"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={deletingId === photo.id}
                        onClick={() => setPendingDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(photo.id)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-neutral-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </SectionSurface>
            ))}
            <PhotoDropZone
              onFiles={handleFiles}
              uploading={uploading}
              compact
              label="Add more"
              hint="Click or drag"
            />
          </div>
        )}
      </PageSection>

      <PhotoLightbox
        photos={sharedPhotos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
