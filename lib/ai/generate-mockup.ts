import OpenAI, { toFile } from "openai";

const MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5";
const FALLBACK_MODEL = "gpt-image-1";

export type MockupSourceImage = {
  bytes: Buffer;
  mimeType: string;
  fileName: string;
};

function buildPrompt(description: string, inspirationCount: number) {
  const inspiration =
    inspirationCount > 0
      ? "Images after the first are materials, screenshots, and inspiration. Apply those finishes, fixtures, colors, and ideas where the request asks. Blend them into the room as a real renovation. Do not make a collage, a mood board, or a side-by-side comparison."
      : "No separate inspiration images were provided. Change the space so it matches the request.";

  return [
    "Create one photorealistic renovation mock-up.",
    "The first image is a photo of the existing space. Keep the same room, camera angle, windows, architecture, and layout. Update finishes, materials, fixtures, and furnishings to match the request.",
    inspiration,
    "Homeowner request:",
    description.trim(),
  ].join("\n\n");
}

function isModelError(error: unknown) {
  if (!(error instanceof OpenAI.APIError)) return false;
  const message = error.message.toLowerCase();
  return (
    error.status === 404 ||
    message.includes("model") ||
    message.includes("does not exist")
  );
}

async function editSpacePhoto(
  openai: OpenAI,
  model: string,
  input: {
    space: MockupSourceImage;
    inspiration: MockupSourceImage[];
    description: string;
  }
) {
  const files = await Promise.all(
    [input.space, ...input.inspiration].map((image, index) =>
      toFile(image.bytes, image.fileName || `reference-${index + 1}.jpg`, {
        type: image.mimeType,
      })
    )
  );

  const response = await openai.images.edit({
    model,
    image: files,
    prompt: buildPrompt(input.description, input.inspiration.length),
    input_fidelity: "high",
    quality: "medium",
    output_format: "jpeg",
    output_compression: 82,
    size: "auto",
    n: 1,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("The mock-up could not be created.");
  }

  return Buffer.from(b64, "base64");
}

export async function generateSpaceMockup(input: {
  space: MockupSourceImage;
  inspiration: MockupSourceImage[];
  description: string;
}): Promise<{ bytes: Buffer; mimeType: "image/jpeg" }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const openai = new OpenAI({ apiKey });

  try {
    const bytes = await editSpacePhoto(openai, MODEL, input);
    return { bytes, mimeType: "image/jpeg" };
  } catch (error) {
    if (MODEL !== FALLBACK_MODEL && isModelError(error)) {
      const bytes = await editSpacePhoto(openai, FALLBACK_MODEL, input);
      return { bytes, mimeType: "image/jpeg" };
    }
    throw error;
  }
}
