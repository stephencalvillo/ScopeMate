import { NextResponse } from "next/server";
import { isContractorCreatedProject } from "@/lib/api/project-access";
import { jsonError } from "@/lib/api/response";
import { createServiceClient } from "@/lib/db/supabase";
import { canEditReview } from "@/lib/contractor/review-access";
import { getReviewProjectByInvitationToken } from "@/lib/contractor/invitations";
import { isShareLinkInvitation } from "@/lib/contractor/project-share";
import { listContractorActionableSuggestions } from "@/lib/contractor/suggestions";
import { getEstimateForReview } from "@/lib/estimates/estimates";
import { loadProjectReadinessSummary } from "@/lib/project/readiness-summary";
import { listProjectPhotosWithUrls } from "@/lib/storage/photos";

export async function GET(
  request: Request,
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
    const can_edit = await canEditReview(token, invitation, request);
    const is_share_link = isShareLinkInvitation(invitation, project);
    const is_contractor_client_project = isContractorCreatedProject(project);

    const supabase = createServiceClient();
    const { data: homeowner } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", invitation.invited_by)
      .maybeSingle();

    const homeowner_name =
      homeowner?.name?.trim() || homeowner?.email?.trim() || "A homeowner";

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
      is_contractor_client_project,
      homeowner_name,
    });
  } catch (error) {
    return jsonError(error);
  }
}
