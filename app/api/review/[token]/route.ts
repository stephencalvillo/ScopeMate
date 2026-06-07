import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { canEditReview } from "@/lib/contractor/review-access";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import { isShareLinkInvitation } from "@/lib/contractor/project-share";
import { listContractorActionableSuggestions } from "@/lib/contractor/suggestions";
import { getEstimateForReview } from "@/lib/estimates/estimates";
import { loadProjectReadinessSummary } from "@/lib/project/readiness-summary";
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
        photo_type:
          "photo_type" in photo
            ? ((photo as { photo_type?: string }).photo_type ?? "current")
            : "current",
      }))
    );
    const readiness = await loadProjectReadinessSummary(
      project.id,
      project,
      photos
    );
    const suggestions = await listContractorActionableSuggestions(
      invitation.id,
      review
    );
    const estimate = await getEstimateForReview(review.id);
    const can_edit = await canEditReview(token, invitation);
    const is_share_link = isShareLinkInvitation(invitation, project);

    return NextResponse.json({
      invitation,
      review,
      project,
      photos,
      readiness,
      suggestions,
      estimate,
      can_edit,
      is_share_link,
    });
  } catch (error) {
    return jsonError(error);
  }
}
