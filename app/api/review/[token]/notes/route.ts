import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { assertReviewEditor } from "@/lib/contractor/review-access";
import { updateReviewNotes } from "@/lib/contractor/suggestions";
import { reviewNotesSchema } from "@/lib/validators/suggestion";

export async function PUT(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    await assertReviewEditor(token, request);
    const body = await request.json();
    const input = reviewNotesSchema.parse(body);
    const review = await updateReviewNotes(token, input.notes);
    return NextResponse.json({ review });
  } catch (error) {
    return jsonError(error);
  }
}
