import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { sendShareLinkEmailForProject } from "@/lib/contractor/send-share-link-email";
import { sendShareLinkEmailSchema } from "@/lib/validators/project";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const input = sendShareLinkEmailSchema.parse(body);

    const result = await sendShareLinkEmailForProject({
      projectId: id,
      email: input.email,
      request,
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
