import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import { listContractorActionableSuggestions } from "@/lib/contractor/suggestions";
import { listProjectPhotosWithUrls } from "@/lib/storage/photos";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const { invitation, review, project } =
      await getReviewProjectByInvitationToken(token);
    const photos = await listProjectPhotosWithUrls(project.id).then((rows) =>
      rows.map((photo) => ({
        id: photo.id,
        file_name: photo.file_name,
        url: photo.url,
      }))
    );
    const suggestions = await listContractorActionableSuggestions(
      invitation.id,
      review
    );

    return NextResponse.json({
      invitation,
      review,
      project,
      photos,
      suggestions,
    });
  } catch (error) {
    return jsonError(error);
  }
}
