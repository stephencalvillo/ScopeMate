import { NextResponse } from "next/server";
import OpenAI from "openai";
import { jsonError } from "@/lib/api/response";
import { AuthError, ForbiddenError, NotFoundError } from "@/lib/auth/clerk";
import { getAccessibleProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import { generateSpaceMockup } from "@/lib/ai/generate-mockup";
import type { MockupSourceImage } from "@/lib/ai/generate-mockup";
import {
  MAX_INSPIRATION_IMAGES,
  MAX_MOCKUP_IMAGE_BYTES,
  MAX_MOCKUP_PROMPT_LENGTH,
  MAX_MOCKUPS_PER_GENERATION,
  MAX_SPACE_PHOTOS,
} from "@/lib/mockups/limits";
import { isAllowedPhotoMimeType } from "@/lib/storage/photos";
import { downloadProjectPhotoBytes } from "@/lib/storage/mockups";
import type { ProjectPhoto } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type SpaceSlot =
  | { type: "photo"; id: string }
  | { type: "file"; index: number };

function friendlyGenerationError(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 429) {
      return "Mock-up studio is busy right now. Try again in a moment.";
    }
    return "The mock-up could not be created. Try again in a moment.";
  }
  if (error instanceof Error && error.message === "Missing OPENAI_API_KEY") {
    return "Mock-up studio is not available right now.";
  }
  return "The mock-up could not be created. Try again in a moment.";
}

async function fileToSource(file: File): Promise<MockupSourceImage> {
  if (!isAllowedPhotoMimeType(file.type)) {
    throw new Error("Please use JPEG, PNG, or WebP images.");
  }
  if (file.size > MAX_MOCKUP_IMAGE_BYTES) {
    throw new Error("Each image needs to be 8 MB or smaller.");
  }
  return {
    bytes: Buffer.from(await file.arrayBuffer()),
    mimeType: file.type,
    fileName: file.name || "image.jpg",
  };
}

function parseSpaceSlots(value: FormDataEntryValue | null): SpaceSlot[] {
  if (typeof value !== "string" || !value.trim()) return [];
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) return [];

  const slots: SpaceSlot[] = [];
  for (const slot of parsed) {
    if (!slot || typeof slot !== "object") continue;
    const candidate = slot as { type?: unknown; id?: unknown; index?: unknown };
    if (candidate.type === "photo" && typeof candidate.id === "string") {
      slots.push({ type: "photo", id: candidate.id });
      continue;
    }
    if (
      candidate.type === "file" &&
      typeof candidate.index === "number" &&
      Number.isInteger(candidate.index)
    ) {
      slots.push({ type: "file", index: candidate.index });
    }
  }
  return slots;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getAccessibleProject(id, { request });
    const formData = await request.formData();
    const promptValue = formData.get("prompt");
    const prompt = typeof promptValue === "string" ? promptValue.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Describe the mock-up you want." },
        { status: 400 }
      );
    }
    if (prompt.length > MAX_MOCKUP_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: "That description is too long." },
        { status: 400 }
      );
    }

    let slots: SpaceSlot[] = [];
    try {
      slots = parseSpaceSlots(formData.get("spaceSlots"));
    } catch {
      return NextResponse.json(
        { error: "Add a photo of your space to mock up." },
        { status: 400 }
      );
    }

    if (slots.length === 0 || slots.length > MAX_SPACE_PHOTOS) {
      return NextResponse.json(
        { error: "Add a photo of your space to mock up." },
        { status: 400 }
      );
    }

    const inspirationFiles = formData
      .getAll("inspiration")
      .filter((entry): entry is File => entry instanceof File);
    if (inspirationFiles.length > MAX_INSPIRATION_IMAGES) {
      return NextResponse.json(
        { error: `You can add up to ${MAX_INSPIRATION_IMAGES} inspiration images.` },
        { status: 400 }
      );
    }

    const photoIds = slots
      .filter((slot): slot is { type: "photo"; id: string } => slot.type === "photo")
      .map((slot) => slot.id);

    const photosById = new Map<string, ProjectPhoto>();
    if (photoIds.length > 0) {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("project_photos")
        .select("*")
        .eq("project_id", id)
        .in("id", photoIds);
      if (error) throw error;
      for (const photo of (data ?? []) as ProjectPhoto[]) {
        photosById.set(photo.id, photo);
      }
    }

    const spaceImages: MockupSourceImage[] = [];
    for (const slot of slots) {
      if (slot.type === "photo") {
        const photo = photosById.get(slot.id);
        if (!photo || !isAllowedPhotoMimeType(photo.mime_type)) {
          return NextResponse.json(
            { error: "One of the space photos could not be used." },
            { status: 400 }
          );
        }
        spaceImages.push({
          bytes: await downloadProjectPhotoBytes(photo.storage_path),
          mimeType: photo.mime_type,
          fileName: photo.file_name,
        });
        continue;
      }

      const file = formData.get(`spaceFile${slot.index}`);
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "One of the space photos could not be used." },
          { status: 400 }
        );
      }
      spaceImages.push(await fileToSource(file));
    }

    const inspiration = await Promise.all(inspirationFiles.map(fileToSource));
    const bases = spaceImages.slice(0, MAX_MOCKUPS_PER_GENERATION);
    const outcomes = await Promise.allSettled(
      bases.map((space) =>
        generateSpaceMockup({
          space,
          inspiration,
          description: prompt,
        })
      )
    );

    const images = outcomes.flatMap((outcome) =>
      outcome.status === "fulfilled"
        ? [
            {
              b64: outcome.value.bytes.toString("base64"),
              mimeType: outcome.value.mimeType,
            },
          ]
        : []
    );

    if (images.length === 0) {
      const failure = outcomes.find((outcome) => outcome.status === "rejected");
      console.error(
        failure && failure.status === "rejected" ? failure.reason : "Mock-up generation failed."
      );
      return NextResponse.json(
        {
          error: friendlyGenerationError(
            failure && failure.status === "rejected" ? failure.reason : null
          ),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ images });
  } catch (error) {
    if (
      error instanceof AuthError ||
      error instanceof ForbiddenError ||
      error instanceof NotFoundError
    ) {
      return jsonError(error);
    }
    if (
      error instanceof Error &&
      (error.message.startsWith("Please use") || error.message.includes("8 MB"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: friendlyGenerationError(error) },
      { status: 502 }
    );
  }
}
