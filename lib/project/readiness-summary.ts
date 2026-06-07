import { isMissingTableError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import { isFinishLevelMaterialsQuestion } from "@/lib/follow-up/finish-level";
import { isTimelineQuestion } from "@/lib/follow-up/timeline";
import { formatProjectLocation } from "@/lib/location/parse";
import type { FollowUpQuestion, Project } from "@/types";

export type ProjectReadinessSummary = {
  target_start: string | null;
  location: string;
  finish_level: string | null;
  photos: {
    current: number;
    inspiration: number;
    total: number;
  };
};

export type ReadinessPhoto = {
  photo_type?: "current" | "inspiration" | string | null;
};

function getAnsweredFollowUpValue(
  questions: FollowUpQuestion[],
  matcher: (question: FollowUpQuestion) => boolean
): string | null {
  const question = questions.find(matcher);
  if (!question || question.skipped || !question.answer) {
    return null;
  }

  if (question.answer === "not_sure") {
    return "Not sure";
  }

  return question.answer;
}

export function countReadinessPhotos(photos: ReadinessPhoto[]) {
  let current = 0;
  let inspiration = 0;

  for (const photo of photos) {
    if (photo.photo_type === "inspiration") {
      inspiration += 1;
    } else {
      current += 1;
    }
  }

  return {
    current,
    inspiration,
    total: photos.length,
  };
}

export function buildProjectReadinessSummary(
  project: Pick<Project, "city" | "zip" | "location">,
  followUpQuestions: FollowUpQuestion[],
  photos: ReadinessPhoto[]
): ProjectReadinessSummary {
  return {
    target_start: getAnsweredFollowUpValue(followUpQuestions, isTimelineQuestion),
    location: formatProjectLocation(project),
    finish_level: getAnsweredFollowUpValue(
      followUpQuestions,
      isFinishLevelMaterialsQuestion
    ),
    photos: countReadinessPhotos(photos),
  };
}

export async function loadProjectReadinessSummary(
  projectId: string,
  project: Pick<Project, "city" | "zip" | "location">,
  photos: ReadinessPhoto[]
): Promise<ProjectReadinessSummary> {
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from("follow_up_questions")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return buildProjectReadinessSummary(
      project,
      (data ?? []) as FollowUpQuestion[],
      photos
    );
  } catch (error) {
    if (isMissingTableError(error)) {
      return buildProjectReadinessSummary(project, [], photos);
    }
    throw error;
  }
}
