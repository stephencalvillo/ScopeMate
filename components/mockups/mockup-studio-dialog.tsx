"use client";

import { useEffect, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@clerk/nextjs";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchPhotos } from "@/lib/phase2/client";
import {
  generateMockups,
  saveMockups,
  type GeneratedMockupImage,
} from "@/lib/mockups/client";
import {
  MAX_INSPIRATION_IMAGES,
  MAX_MOCKUP_PROMPT_LENGTH,
  MAX_MOCKUPS_PER_GENERATION,
  MAX_SPACE_PHOTOS,
} from "@/lib/mockups/limits";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PLACEHOLDER =
  "Example: Use the wood screenshot for the new cabinets, and the tile for the backsplash.";

type StudioImage = {
  id: string;
  url: string;
  name: string;
  kind: "project" | "local";
  photoId?: string;
  file?: File;
};

type GeneratedPreview = GeneratedMockupImage & {
  id: string;
  url: string;
};

function StepHeading({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-neutral-950 text-sm font-medium text-white">
        {step}
      </span>
      <h3 className="text-base font-semibold text-neutral-900">{children}</h3>
    </div>
  );
}

async function compressImageFile(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.85);
    });
    if (!blob) return file;
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function previewUrlFromBase64(b64: string, mimeType: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}

function ImageWell({
  label,
  images,
  max,
  hint,
  onAdd,
  onRemove,
  onInvalid,
}: {
  label: string;
  images: StudioImage[];
  max: number;
  hint?: string;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onInvalid: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const canAdd = images.length < max;

  function openPicker() {
    if (canAdd) inputRef.current?.click();
  }

  function takeFiles(list: FileList | File[]) {
    const files = Array.from(list);
    const accepted = files.filter((file) => ACCEPTED_TYPES.includes(file.type));
    if (files.length > 0 && accepted.length === 0) {
      onInvalid();
      return;
    }
    if (accepted.length === 0) return;
    onAdd(accepted.slice(0, max - images.length));
  }

  const emptySlots = images.length === 0 ? 3 : canAdd ? 1 : 0;

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (canAdd) setDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!canAdd || !event.dataTransfer.files.length) return;
        takeFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) takeFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <p className="mb-3 text-sm font-medium text-neutral-900">{label}</p>
      <div
        className={cn(
          "grid grid-cols-3 gap-3",
          dragging && "rounded-[8px] ring-2 ring-neutral-300"
        )}
      >
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-[4/3] overflow-hidden rounded-[8px] bg-neutral-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.name}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(image.id)}
              className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-neutral-700 opacity-0 shadow-sm transition-opacity hover:bg-white hover:text-neutral-900 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 group-hover:opacity-100"
              aria-label={`Remove ${image.name}`}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        ))}
        {Array.from({ length: emptySlots }, (_, index) => {
          const primary = images.length === 0 ? index === 0 : true;
          return (
            <button
              key={`empty-${index}`}
              type="button"
              onClick={openPicker}
              className={cn(
                "flex aspect-[4/3] items-center justify-center rounded-[8px] transition-colors",
                primary
                  ? "bg-neutral-100 hover:bg-neutral-200/80"
                  : "border border-neutral-200 bg-white hover:bg-neutral-50"
              )}
              aria-label={`Add ${label.toLowerCase()}`}
            >
              {primary ? (
                <ImageIcon className="h-6 w-6 text-neutral-400" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
      {hint ? <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

export function MockupStudioDialog({
  projectId,
  open,
  onOpenChange,
  preview = false,
  onSaved,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview?: boolean;
  onSaved: () => void;
}) {
  const { getToken, isSignedIn } = useAuth();
  const descriptionId = useId();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef({ getToken, isSignedIn });
  sessionRef.current = { getToken, isSignedIn };
  const [space, setSpace] = useState<StudioImage[]>([]);
  const [inspiration, setInspiration] = useState<StudioImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<GeneratedPreview[]>([]);
  const [view, setView] = useState<"compose" | "working" | "result">("compose");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function release(images: StudioImage[], generated: GeneratedPreview[]) {
    for (const image of images) {
      if (image.kind === "local") URL.revokeObjectURL(image.url);
    }
    for (const image of generated) URL.revokeObjectURL(image.url);
  }

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      return;
    }

    setSpace([]);
    setInspiration([]);
    setPrompt("");
    setResults([]);
    setView("compose");
    setBusy(false);
    setSaving(false);
    setError(null);

    if (preview) return;

    let cancelled = false;
    const session = sessionRef.current;
    void (async () => {
      try {
        const photos = await fetchPhotos(
          projectId,
          session.isSignedIn ? session.getToken : undefined
        );
        if (cancelled) return;
        setSpace((current) => {
          const locals = current.filter((image) => image.kind === "local");
          const fromProject = photos.slice(0, MAX_SPACE_PHOTOS).map((photo) => ({
            id: photo.id,
            url: photo.url,
            name: photo.file_name,
            kind: "project" as const,
            photoId: photo.id,
          }));
          return [...fromProject, ...locals].slice(0, MAX_SPACE_PHOTOS);
        });
      } catch {
        if (!cancelled) setSpace([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, preview, projectId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function addImages(
    current: StudioImage[],
    files: File[],
    max: number,
    setCurrent: (images: StudioImage[]) => void
  ) {
    const room = max - current.length;
    if (room <= 0) return;
    const next = files.slice(0, room).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
      kind: "local" as const,
      file,
    }));
    setCurrent([...current, ...next]);
    setError(null);
  }

  function removeImage(
    current: StudioImage[],
    id: string,
    setCurrent: (images: StudioImage[]) => void
  ) {
    const image = current.find((entry) => entry.id === id);
    if (image?.kind === "local") URL.revokeObjectURL(image.url);
    setCurrent(current.filter((entry) => entry.id !== id));
  }

  async function handleGenerate() {
    const description = prompt.trim();
    if (space.length === 0) {
      setError("Add a photo of your space to mock up.");
      setView("compose");
      return;
    }
    if (!description) {
      setError("Describe the mock-up you want.");
      setView("compose");
      return;
    }
    if (preview) {
      setError("Mock-ups can be created on a real project.");
      return;
    }

    const keepResult = view === "result";
    setError(null);
    setBusy(true);
    if (!keepResult) setView("working");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const formData = new FormData();
      formData.set("prompt", description);
      const slots: Array<
        { type: "photo"; id: string } | { type: "file"; index: number }
      > = [];
      let fileIndex = 0;

      for (const image of space) {
        if (image.kind === "project" && image.photoId) {
          slots.push({ type: "photo", id: image.photoId });
          continue;
        }
        if (!image.file) continue;
        formData.append(
          `spaceFile${fileIndex}`,
          await compressImageFile(image.file)
        );
        slots.push({ type: "file", index: fileIndex });
        fileIndex += 1;
      }

      formData.set("spaceSlots", JSON.stringify(slots));
      for (const image of inspiration) {
        if (!image.file) continue;
        formData.append("inspiration", await compressImageFile(image.file));
      }

      const images = await generateMockups(
        projectId,
        formData,
        isSignedIn ? getToken : undefined,
        controller.signal
      );
      if (controller.signal.aborted) return;

      const previews = images.map((image) => ({
        ...image,
        id: crypto.randomUUID(),
        url: previewUrlFromBase64(image.b64, image.mimeType),
      }));
      setResults((current) => {
        for (const image of current) URL.revokeObjectURL(image.url);
        return previews;
      });
      setView("result");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(
        err instanceof Error ? err.message : "Could not create the mock-up."
      );
      if (!keepResult) setView("compose");
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  async function handleFinish() {
    if (results.length === 0 || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveMockups(
        projectId,
        {
          prompt: prompt.trim(),
          images: results.map(({ b64, mimeType }) => ({ b64, mimeType })),
        },
        isSignedIn ? getToken : undefined
      );
      release(space, results);
      release(inspiration, []);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the mock-up."
      );
      setSaving(false);
    }
  }

  function handleEdit() {
    setView("compose");
    window.setTimeout(() => descriptionRef.current?.focus(), 0);
  }

  const workingCopy =
    Math.min(space.length, MAX_MOCKUPS_PER_GENERATION) > 1
      ? "Creating your mock-ups"
      : "Creating your mock-up";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          abortRef.current?.abort();
          release(space, results);
          release(inspiration, []);
        }
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-900/40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex h-[85dvh] w-[85vw] max-w-none -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-white shadow-xl outline-none"
          aria-describedby={undefined}
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] px-5 py-4">
            <Dialog.Close
              className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
            <Dialog.Title className="text-base font-medium text-neutral-900">
              Mock-up studio
            </Dialog.Title>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
            {view === "compose" ? (
              <div className="space-y-8">
                <div className="space-y-5">
                  <StepHeading step={1}>
                    Upload photos, images, and inspiration
                  </StepHeading>
                  <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    <ImageWell
                      label="Existing photos of your space"
                      images={space}
                      max={MAX_SPACE_PHOTOS}
                      hint={
                        space.length > MAX_MOCKUPS_PER_GENERATION
                          ? "The first two photos are used for this mock-up."
                          : undefined
                      }
                      onAdd={(files) =>
                        addImages(space, files, MAX_SPACE_PHOTOS, setSpace)
                      }
                      onRemove={(id) => removeImage(space, id, setSpace)}
                      onInvalid={() =>
                        setError("Please use JPEG, PNG, or WebP images.")
                      }
                    />
                    <ImageWell
                      label="Materials, screenshots and inspiration images"
                      images={inspiration}
                      max={MAX_INSPIRATION_IMAGES}
                      onAdd={(files) =>
                        addImages(
                          inspiration,
                          files,
                          MAX_INSPIRATION_IMAGES,
                          setInspiration
                        )
                      }
                      onRemove={(id) =>
                        removeImage(inspiration, id, setInspiration)
                      }
                      onInvalid={() =>
                        setError("Please use JPEG, PNG, or WebP images.")
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <StepHeading step={2}>Describe your mock-up</StepHeading>
                  <Textarea
                    ref={descriptionRef}
                    id={descriptionId}
                    aria-label="Describe your mock-up"
                    value={prompt}
                    maxLength={MAX_MOCKUP_PROMPT_LENGTH}
                    placeholder={PLACEHOLDER}
                    className="min-h-28 rounded-[8px]"
                    onChange={(event) => {
                      setPrompt(event.target.value);
                      setError(null);
                    }}
                  />
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <Button type="button" onClick={() => void handleGenerate()}>
                  Generate
                </Button>
              </div>
            ) : null}

            {view === "working" ? (
              <div className="mx-auto flex max-w-4xl flex-col gap-4">
                <p className="text-sm font-semibold text-neutral-900">
                  {workingCopy}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Applying your inspiration to the photo of your space. This
                  usually takes a moment.
                </p>
                <div className="flex aspect-[16/10] items-center justify-center rounded-[12px] bg-neutral-100">
                  <Loader2
                    className="h-8 w-8 animate-spin text-neutral-400"
                    aria-hidden
                  />
                </div>
              </div>
            ) : null}

            {view === "result" ? (
              <div className="mx-auto flex max-w-4xl flex-col gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {prompt.trim()}
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-sm text-[var(--muted)] transition-colors hover:text-neutral-900"
                    onClick={handleEdit}
                    disabled={busy || saving}
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-4">
                  {results.map((image) => (
                    <div key={image.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt="Generated mock-up"
                        className={cn(
                          "w-full rounded-[12px]",
                          busy && "opacity-60"
                        )}
                      />
                      {busy ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2
                            className="h-8 w-8 animate-spin text-neutral-700"
                            aria-hidden
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </div>
            ) : null}
          </div>

          {view === "result" ? (
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border)] px-5 py-4">
              <Button
                type="button"
                variant="outline"
                disabled={busy || saving}
                onClick={() => void handleGenerate()}
              >
                Regenerate
              </Button>
              <Button
                type="button"
                disabled={busy || saving || results.length === 0}
                onClick={() => void handleFinish()}
              >
                {saving ? "Saving..." : "Finish"}
              </Button>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
