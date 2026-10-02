import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { isAllowedPhotoMimeType } from "@/lib/storage/photos";
import {
  listProjectMockupsWithUrls,
  uploadProjectMockup,
} from "@/lib/storage/mockups";
import { isMissingTableError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import {
  MAX_MOCKUP_IMAGE_BYTES,
  MAX_MOCKUP_PROMPT_LENGTH,
  MAX_MOCKUPS_PER_GENERATION,
  MAX_MOCKUPS_PER_PROJECT,
} from "@/lib/mockups/limits";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getAccessibleProject(id, { request });
    const mockups = await listProjectMockupsWithUrls(id);
    return NextResponse.json({ mockups });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ mockups: [] });
    }
    return jsonError(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getAccessibleProject(id, { request });
    const body = (await request.json()) as {
      prompt?: unknown;
      images?: unknown;
    };

    const prompt =
      typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json(
        { error: "Describe the mock-up before saving it." },
        { status: 400 }
      );
    }
    if (prompt.length > MAX_MOCKUP_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: "That description is too long." },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json(
        { error: "Create a mock-up before finishing." },
        { status: 400 }
      );
    }
    if (body.images.length > MAX_MOCKUPS_PER_GENERATION) {
      return NextResponse.json(
        { error: "Too many mock-ups to save at once." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { count, error: countError } = await supabase
      .from("project_mockups")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id);

    if (countError) throw countError;
    const existing = count ?? 0;
    if (existing + body.images.length > MAX_MOCKUPS_PER_PROJECT) {
      return NextResponse.json(
        {
          error: `A project can keep up to ${MAX_MOCKUPS_PER_PROJECT} mock-ups.`,
        },
        { status: 400 }
      );
    }

    const saved = [];
    for (const [index, image] of body.images.entries()) {
      if (
        !image ||
        typeof image !== "object" ||
        typeof (image as { b64?: unknown }).b64 !== "string" ||
        typeof (image as { mimeType?: unknown }).mimeType !== "string"
      ) {
        return NextResponse.json(
          { error: "A mock-up image was missing." },
          { status: 400 }
        );
      }

      const mimeType = (image as { mimeType: string }).mimeType;
      if (!isAllowedPhotoMimeType(mimeType)) {
        return NextResponse.json(
          { error: "Mock-ups need to be JPEG, PNG, or WebP images." },
          { status: 400 }
        );
      }

      const bytes = Buffer.from((image as { b64: string }).b64, "base64");
      if (bytes.length === 0 || bytes.length > MAX_MOCKUP_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "A mock-up image was too large to save." },
          { status: 400 }
        );
      }

      const mockup = await uploadProjectMockup({
        homeownerId: project.homeowner_id ?? `guest-${id}`,
        projectId: id,
        file: bytes,
        fileName: `mock-up-${existing + index + 1}.jpg`,
        mimeType,
        fileSize: bytes.length,
        prompt,
        sortOrder: existing + index,
      });
      saved.push(mockup);
    }

    return NextResponse.json({ mockups: saved }, { status: 201 });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json(
        { error: "Mock-ups are not set up yet." },
        { status: 503 }
      );
    }
    return jsonError(error);
  }
}
