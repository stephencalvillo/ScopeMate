import { ForbiddenError, NotFoundError } from "@/lib/auth/clerk";
import { getInvitationByToken } from "@/lib/contractor/invitations";
import { buildReviewScopeSnapshot } from "@/lib/contractor/review-scope-snapshot";
import { buildProjectUrl } from "@/lib/contractor/urls";
import { createServiceClient } from "@/lib/db/supabase";
import {
  sendFollowUpAnsweredEmail,
  sendFollowUpRequestedEmail,
  sendReviewCompleteEmail,
} from "@/lib/email/send-contractor-emails";
import { findMatchingSuggestions } from "@/lib/suggestions/matching";
import type {
  ContractorInvitation,
  ContractorReview,
  Project,
  ScopeItem,
  ScopeSuggestion,
  ScopeSuggestionWithMeta,
  SuggestionFollowUp,
  User,
} from "@/types";

function reviewIsEditable(review: ContractorReview) {
  return review.status === "in_progress";
}

async function getReviewForInvitation(invitationId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contractor_reviews")
    .select("*")
    .eq("invitation_id", invitationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("Review not found.");
  return data as ContractorReview;
}

async function getSuggestionForInvitation(
  invitationId: string,
  suggestionId: string
) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("scope_suggestions")
    .select("*")
    .eq("id", suggestionId)
    .eq("invitation_id", invitationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("Suggestion not found.");
  return data as ScopeSuggestion;
}

export async function listDraftSuggestionsForInvitation(
  invitationId: string
) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("scope_suggestions")
    .select("*, suggestion_follow_ups(*)")
    .eq("invitation_id", invitationId)
    .eq("status", "draft")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as Array<
    ScopeSuggestion & { suggestion_follow_ups?: SuggestionFollowUp[] }
  >).map((row) => ({
    ...row,
    follow_ups: row.suggestion_follow_ups ?? [],
  }));
}

export async function listContractorActionableSuggestions(
  invitationId: string,
  review: ContractorReview
) {
  const supabase = createServiceClient();

  if (review.status === "in_progress") {
    return listDraftSuggestionsForInvitation(invitationId);
  }

  const { data, error } = await supabase
    .from("scope_suggestions")
    .select("*, suggestion_follow_ups(*)")
    .eq("invitation_id", invitationId)
    .eq("status", "follow_up_requested")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as Array<
    ScopeSuggestion & { suggestion_follow_ups?: SuggestionFollowUp[] }
  >).map((row) => ({
    ...row,
    follow_ups: row.suggestion_follow_ups ?? [],
  }));
}

export async function listHomeownerSuggestions(projectId: string) {
  const supabase = createServiceClient();

  const { data: submittedInvites, error: inviteError } = await supabase
    .from("contractor_invitations")
    .select("id, contractor_name, contractor_email, status")
    .eq("project_id", projectId)
    .eq("status", "submitted");

  if (inviteError) throw inviteError;

  const invitationIds = (submittedInvites ?? []).map((invite) => invite.id);
  if (invitationIds.length === 0) return [];

  const { data, error } = await supabase
    .from("scope_suggestions")
    .select("*, suggestion_follow_ups(*)")
    .eq("project_id", projectId)
    .in("invitation_id", invitationIds)
    .in("status", ["pending", "follow_up_requested", "accepted", "rejected"])
    .order("created_at", { ascending: true });

  if (error) throw error;

  const inviteMap = new Map(
    (submittedInvites ?? []).map((invite) => [invite.id, invite])
  );

  return mapHomeownerSuggestions(data ?? [], inviteMap);
}

export async function listHomeownerSuggestionsForInvitation(
  projectId: string,
  invitationId: string
) {
  const supabase = createServiceClient();

  const { data: invitation, error: inviteError } = await supabase
    .from("contractor_invitations")
    .select("id, contractor_name, contractor_email, status")
    .eq("project_id", projectId)
    .eq("id", invitationId)
    .maybeSingle();

  if (inviteError) throw inviteError;
  if (!invitation) return [];

  const { data, error } = await supabase
    .from("scope_suggestions")
    .select("*, suggestion_follow_ups(*)")
    .eq("project_id", projectId)
    .eq("invitation_id", invitationId)
    .in("status", ["pending", "follow_up_requested", "accepted", "rejected"])
    .order("created_at", { ascending: true });

  if (error) throw error;

  const inviteMap = new Map([[invitation.id, invitation]]);
  return mapHomeownerSuggestions(data ?? [], inviteMap);
}

function mapHomeownerSuggestions(
  rows: Array<ScopeSuggestion & { suggestion_follow_ups?: SuggestionFollowUp[] }>,
  inviteMap: Map<
    string,
    {
      id: string;
      contractor_name: string;
      contractor_email: string;
      status: string;
    }
  >
) {
  return rows.map((row) => {
    const invite = inviteMap.get(row.invitation_id);
    return {
      ...row,
      contractor_name: invite?.contractor_name,
      follow_ups: row.suggestion_follow_ups ?? [],
    } satisfies ScopeSuggestionWithMeta;
  });
}

export async function createDraftSuggestion({
  token,
  payload,
}: {
  token: string;
  payload: {
    suggestion_type: ScopeSuggestion["suggestion_type"];
    target_scope_item_id?: string;
    category?: string;
    suggested_text?: string;
    contractor_note?: string;
  };
}) {
  const invitation = await getInvitationByToken(token);
  const review = await getReviewForInvitation(invitation.id);

  if (!reviewIsEditable(review)) {
    throw new ForbiddenError("This review has already been submitted.");
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("scope_suggestions")
    .insert({
      project_id: invitation.project_id,
      invitation_id: invitation.id,
      target_scope_item_id: payload.target_scope_item_id ?? null,
      suggestion_type: payload.suggestion_type,
      category: payload.category ?? null,
      suggested_text: payload.suggested_text ?? null,
      contractor_note: payload.contractor_note ?? null,
      status: "draft",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ScopeSuggestion;
}

export async function updateDraftSuggestion({
  token,
  suggestionId,
  payload,
}: {
  token: string;
  suggestionId: string;
  payload: {
    category?: string;
    suggested_text?: string;
    contractor_note?: string;
  };
}) {
  const invitation = await getInvitationByToken(token);
  const review = await getReviewForInvitation(invitation.id);
  const suggestion = await getSuggestionForInvitation(
    invitation.id,
    suggestionId
  );

  if (!reviewIsEditable(review)) {
    throw new ForbiddenError("This review has already been submitted.");
  }

  if (suggestion.status !== "draft") {
    throw new ForbiddenError("Only draft suggestions can be edited.");
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("scope_suggestions")
    .update({
      category: payload.category ?? suggestion.category,
      suggested_text: payload.suggested_text ?? suggestion.suggested_text,
      contractor_note: payload.contractor_note ?? suggestion.contractor_note,
      updated_at: new Date().toISOString(),
    })
    .eq("id", suggestionId)
    .select("*")
    .single();

  if (error) throw error;
  return data as ScopeSuggestion;
}

export async function withdrawDraftSuggestion(token: string, suggestionId: string) {
  const invitation = await getInvitationByToken(token);
  const review = await getReviewForInvitation(invitation.id);
  const suggestion = await getSuggestionForInvitation(
    invitation.id,
    suggestionId
  );

  if (!reviewIsEditable(review)) {
    throw new ForbiddenError("This review has already been submitted.");
  }

  if (suggestion.status !== "draft") {
    throw new ForbiddenError("Only draft suggestions can be withdrawn.");
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("scope_suggestions")
    .update({
      status: "withdrawn",
      updated_at: new Date().toISOString(),
    })
    .eq("id", suggestionId)
    .select("*")
    .single();

  if (error) throw error;
  return data as ScopeSuggestion;
}

export async function updateReviewNotes(token: string, notes?: string) {
  const invitation = await getInvitationByToken(token);
  const review = await getReviewForInvitation(invitation.id);

  if (!reviewIsEditable(review)) {
    throw new ForbiddenError("This review has already been submitted.");
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contractor_reviews")
    .update({
      notes: notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", review.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ContractorReview;
}

export async function completeContractorReview({
  token,
  homeowner,
  project,
}: {
  token: string;
  homeowner: User;
  project: Project;
}) {
  const invitation = await getInvitationByToken(token);
  const review = await getReviewForInvitation(invitation.id);

  if (!reviewIsEditable(review)) {
    throw new ForbiddenError("This review has already been submitted.");
  }

  const drafts = await listDraftSuggestionsForInvitation(invitation.id);
  const hasNotes = Boolean(review.notes?.trim());
  const hasSuggestions = drafts.length > 0;

  if (!hasNotes && !hasSuggestions) {
    throw new ForbiddenError(
      "Add at least one suggestion or a general note before completing your review."
    );
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  if (drafts.length > 0) {
    const { error: suggestionError } = await supabase
      .from("scope_suggestions")
      .update({ status: "pending", updated_at: now })
      .eq("invitation_id", invitation.id)
      .eq("status", "draft");

    if (suggestionError) throw suggestionError;
  }

  const scopeSnapshot = await buildReviewScopeSnapshot({
    projectId: project.id,
    aiSummary: project.ai_summary,
    drafts,
  });

  const { error: reviewError } = await supabase
    .from("contractor_reviews")
    .update({
      status: "submitted",
      submitted_at: now,
      updated_at: now,
      scope_snapshot: scopeSnapshot,
    })
    .eq("id", review.id);

  if (reviewError) throw reviewError;

  const { error: inviteError } = await supabase
    .from("contractor_invitations")
    .update({
      status: "submitted",
      updated_at: now,
    })
    .eq("id", invitation.id);

  if (inviteError) throw inviteError;

  await sendReviewCompleteEmail({
    to: homeowner.email,
    homeownerName: homeowner.name ?? homeowner.email,
    contractorName: invitation.contractor_name,
    projectTitle: project.title,
    projectUrl: buildProjectUrl(project.id),
    suggestionCount: drafts.length,
  });

  return { submitted_count: drafts.length };
}

async function mergeAcceptedSuggestion(
  suggestion: ScopeSuggestion,
  invitation: ContractorInvitation
) {
  const supabase = createServiceClient();

  if (suggestion.suggestion_type === "note") {
    return null;
  }

  if (suggestion.suggestion_type === "add") {
    const { count } = await supabase
      .from("scope_items")
      .select("*", { count: "exact", head: true })
      .eq("project_id", suggestion.project_id)
      .eq("status", "active");

    const { data, error } = await supabase
      .from("scope_items")
      .insert({
        project_id: suggestion.project_id,
        category: suggestion.category ?? "other",
        text: suggestion.suggested_text ?? "",
        source: "contractor",
        priority: "recommended",
        status: "active",
        sort_order: count ?? 0,
        needs_verification: false,
        suggestion_id: suggestion.id,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as ScopeItem;
  }

  if (!suggestion.target_scope_item_id) {
    throw new NotFoundError("Target scope item not found.");
  }

  if (suggestion.suggestion_type === "edit") {
    const { data: existingItem, error: existingError } = await supabase
      .from("scope_items")
      .select("text")
      .eq("id", suggestion.target_scope_item_id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existingItem) throw new NotFoundError("Target scope item not found.");

    const suggestedText = suggestion.suggested_text?.trim();
    const nextText = suggestedText || (existingItem.text as string);

    const { data, error } = await supabase
      .from("scope_items")
      .update({
        text: nextText,
        source: "contractor",
        suggestion_id: suggestion.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", suggestion.target_scope_item_id)
      .select("*")
      .single();

    if (error) throw error;
    return data as ScopeItem;
  }

  const { data, error } = await supabase
    .from("scope_items")
    .update({
      status: "removed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", suggestion.target_scope_item_id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ScopeItem;
}

async function resolveMatchingSuggestions({
  acceptedSuggestion,
  homeownerId,
  resolvedAt,
}: {
  acceptedSuggestion: ScopeSuggestion;
  homeownerId: string;
  resolvedAt: string;
}) {
  if (acceptedSuggestion.suggestion_type === "note") {
    return [];
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("scope_suggestions")
    .select("*")
    .eq("project_id", acceptedSuggestion.project_id)
    .in("status", ["pending", "follow_up_requested"]);

  if (error) throw error;

  const matches = findMatchingSuggestions(
    acceptedSuggestion,
    (data ?? []) as ScopeSuggestion[]
  );

  if (matches.length === 0) {
    return [];
  }

  const matchIds = matches.map((suggestion) => suggestion.id);
  const { data: updated, error: updateError } = await supabase
    .from("scope_suggestions")
    .update({
      status: "accepted",
      resolved_at: resolvedAt,
      resolved_by: homeownerId,
      updated_at: resolvedAt,
    })
    .in("id", matchIds)
    .select("*");

  if (updateError) throw updateError;

  return (updated ?? []) as ScopeSuggestion[];
}

export async function acceptSuggestion({
  projectId,
  suggestionId,
  homeownerId,
}: {
  projectId: string;
  suggestionId: string;
  homeownerId: string;
}) {
  const supabase = createServiceClient();
  const { data: suggestion, error } = await supabase
    .from("scope_suggestions")
    .select("*")
    .eq("id", suggestionId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  if (!suggestion) throw new NotFoundError("Suggestion not found.");

  const row = suggestion as ScopeSuggestion;
  if (!["pending", "follow_up_requested"].includes(row.status)) {
    throw new ForbiddenError("This suggestion has already been resolved.");
  }

  const { data: invitation, error: inviteError } = await supabase
    .from("contractor_invitations")
    .select("*")
    .eq("id", row.invitation_id)
    .maybeSingle();

  if (inviteError) throw inviteError;
  if (!invitation) throw new NotFoundError("Invitation not found.");

  const scopeItem = await mergeAcceptedSuggestion(
    row,
    invitation as ContractorInvitation
  );
  const now = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from("scope_suggestions")
    .update({
      status: "accepted",
      resolved_at: now,
      resolved_by: homeownerId,
      updated_at: now,
    })
    .eq("id", suggestionId)
    .select("*")
    .single();

  if (updateError) throw updateError;

  const superseded = await resolveMatchingSuggestions({
    acceptedSuggestion: updated as ScopeSuggestion,
    homeownerId,
    resolvedAt: now,
  });

  return {
    suggestion: updated as ScopeSuggestion,
    scope_item: scopeItem,
    superseded_suggestions: superseded,
  };
}

export async function rejectSuggestion({
  projectId,
  suggestionId,
  homeownerId,
  reason,
}: {
  projectId: string;
  suggestionId: string;
  homeownerId: string;
  reason?: string;
}) {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("scope_suggestions")
    .update({
      status: "rejected",
      homeowner_rejection_reason: reason ?? null,
      resolved_at: now,
      resolved_by: homeownerId,
      updated_at: now,
    })
    .eq("id", suggestionId)
    .eq("project_id", projectId)
    .in("status", ["pending", "follow_up_requested"])
    .select("*")
    .single();

  if (error) throw error;
  if (!data) throw new NotFoundError("Suggestion not found.");

  return data as ScopeSuggestion;
}

export async function askSuggestionFollowUp({
  project,
  homeowner,
  suggestionId,
  message,
}: {
  project: Project;
  homeowner: User;
  suggestionId: string;
  message: string;
}) {
  const supabase = createServiceClient();
  const { data: suggestion, error } = await supabase
    .from("scope_suggestions")
    .select("*")
    .eq("id", suggestionId)
    .eq("project_id", project.id)
    .maybeSingle();

  if (error) throw error;
  if (!suggestion) throw new NotFoundError("Suggestion not found.");

  const row = suggestion as ScopeSuggestion;
  if (row.status !== "pending") {
    throw new ForbiddenError("Follow-up is only available on pending suggestions.");
  }

  const { data: invitation, error: inviteError } = await supabase
    .from("contractor_invitations")
    .select("*")
    .eq("id", row.invitation_id)
    .maybeSingle();

  if (inviteError) throw inviteError;
  if (!invitation) throw new NotFoundError("Invitation not found.");

  const now = new Date().toISOString();

  const { error: followUpError } = await supabase
    .from("suggestion_follow_ups")
    .insert({
      suggestion_id: suggestionId,
      author_role: "homeowner",
      message,
    });

  if (followUpError) throw followUpError;

  const { data: updated, error: updateError } = await supabase
    .from("scope_suggestions")
    .update({
      status: "follow_up_requested",
      updated_at: now,
    })
    .eq("id", suggestionId)
    .select("*")
    .single();

  if (updateError) throw updateError;

  await sendFollowUpRequestedEmail({
    to: (invitation as ContractorInvitation).contractor_email,
    contractorName: (invitation as ContractorInvitation).contractor_name,
    projectTitle: project.title,
    reviewToken: (invitation as ContractorInvitation).invitation_token,
    message,
  });

  return updated as ScopeSuggestion;
}

export async function respondToSuggestionFollowUp({
  token,
  suggestionId,
  message,
  homeowner,
  project,
}: {
  token: string;
  suggestionId: string;
  message: string;
  homeowner: User;
  project: Project;
}) {
  const invitation = await getInvitationByToken(token);
  const suggestion = await getSuggestionForInvitation(
    invitation.id,
    suggestionId
  );

  if (suggestion.status !== "follow_up_requested") {
    throw new ForbiddenError("This suggestion is not awaiting a follow-up response.");
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { error: followUpError } = await supabase
    .from("suggestion_follow_ups")
    .insert({
      suggestion_id: suggestionId,
      author_role: "contractor",
      message,
    });

  if (followUpError) throw followUpError;

  const { data, error } = await supabase
    .from("scope_suggestions")
    .update({
      status: "pending",
      updated_at: now,
    })
    .eq("id", suggestionId)
    .select("*")
    .single();

  if (error) throw error;

  await sendFollowUpAnsweredEmail({
    to: homeowner.email,
    homeownerName: homeowner.name ?? homeowner.email,
    contractorName: invitation.contractor_name,
    projectTitle: project.title,
    projectUrl: buildProjectUrl(project.id),
    message,
  });

  return data as ScopeSuggestion;
}

export async function getHomeownerForProject(projectId: string) {
  const supabase = createServiceClient();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("homeowner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) throw new NotFoundError("Project not found.");

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", project.homeowner_id)
    .maybeSingle();

  if (userError) throw userError;
  if (!user) throw new NotFoundError("Homeowner not found.");

  return user as User;
}
