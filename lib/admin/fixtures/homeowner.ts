import type { ProjectActivityItem } from "@/lib/contractor/activity";
import {
  SHARE_LINK_PLACEHOLDER_EMAIL,
  SHARE_LINK_PLACEHOLDER_NAME,
} from "@/lib/contractor/project-share";
import type { ReviewedScopeDetail } from "@/lib/contractor/reviewed-scopes";
import type { ReviewedScopeSummary } from "@/lib/contractor/reviewed-scopes";
import type { ProjectPhotoWithUrl } from "@/lib/phase2/client";
import type {
  ContractorInvitationWithReview,
  FollowUpQuestion,
  Project,
  ProjectWithScope,
  ScopeItem,
  ScopeSuggestionWithMeta,
} from "@/types";
import {
  PREVIEW_HOMEOWNER_PROJECT_ID,
  PREVIEW_INVITATION_ID,
  PREVIEW_JUAN_INVITATION_ID,
  PREVIEW_KURT_INVITATION_ID,
  PREVIEW_REVIEW_TOKEN,
  PREVIEW_SHARE_INVITATION_ID,
  PREVIEW_TIMESTAMP,
} from "./constants";
import { buildPreviewScopeSnapshot } from "./scope-snapshot";

const scopeItems: ScopeItem[] = [
  {
    id: "preview-scope-1",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    category: "planning",
    text: "Develop design plans for kitchen layout and guest bathroom.",
    source: "ai",
    priority: "required",
    status: "active",
    sort_order: 0,
    needs_verification: false,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-scope-2",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    category: "planning",
    text: "Select materials, fixtures, and finishes for both kitchen and bathroom.",
    source: "ai",
    priority: "required",
    status: "active",
    sort_order: 1,
    needs_verification: false,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-scope-3",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    category: "permits",
    text: "Obtain necessary permits for kitchen and bathroom remodel.",
    source: "ai",
    priority: "required",
    status: "active",
    sort_order: 2,
    needs_verification: true,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-scope-4",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    category: "drywall",
    text: "Hang, tape, and finish drywall in kitchen and guest bathroom.",
    source: "ai",
    priority: "required",
    status: "active",
    sort_order: 3,
    needs_verification: false,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-scope-5",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    category: "carpentry",
    text: "Frame kitchen walls, bulkheads, and bathroom blocking.",
    source: "ai",
    priority: "required",
    status: "active",
    sort_order: 4,
    needs_verification: false,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
];

export const previewHomeownerKitchenProject: ProjectWithScope = {
  id: PREVIEW_HOMEOWNER_PROJECT_ID,
  homeowner_id: "preview-homeowner-user",
  creator_role: "homeowner",
  created_by_user_id: "preview-homeowner-user",
  title: "Kitchen and bath remodel",
  project_type: "kitchen",
  city: "Long Beach",
  zip: "90802",
  location: "Long Beach, CA",
  original_description:
    "Remodel both the kitchen and guest bathroom in a Long Beach, CA home.",
  ai_summary:
    "This project involves remodeling both the kitchen and guest bathroom in a Long Beach, CA home. Key considerations include updating fixtures, cabinetry, and finishes in both spaces. The homeowner plans to start the project in 3-6 months, allowing time for design and planning. Coordination of plumbing, electrical, and potential structural changes will be important.",
  status: "scope_ready",
  share_token: PREVIEW_REVIEW_TOKEN,
  share_enabled: true,
  share_expires_at: null,
  share_enabled_at: PREVIEW_TIMESTAMP,
  creation_completed_at: PREVIEW_TIMESTAMP,
  accepted_estimate_id: null,
  created_at: PREVIEW_TIMESTAMP,
  updated_at: PREVIEW_TIMESTAMP,
  scope_items: scopeItems,
};

export const previewHomeownerProjectList: Project[] = [
  previewHomeownerKitchenProject,
  {
    id: "preview-homeowner-deck",
    homeowner_id: "preview-homeowner-user",
    creator_role: "homeowner",
    created_by_user_id: "preview-homeowner-user",
    title: "Back deck expansion",
    project_type: "deck",
    city: "Austin",
    zip: "78704",
    location: "Austin, TX 78704",
    original_description: "Expand the existing deck and add a shade pergola.",
    ai_summary: "Deck expansion with new framing, decking, and pergola structure.",
    status: "draft",
    share_token: null,
    share_enabled: false,
    share_expires_at: null,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
];

const previewInvitation = {
  id: PREVIEW_INVITATION_ID,
  project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
  invited_by: "preview-homeowner-user",
  contractor_name: "Maria Santos",
  contractor_email: "maria@northsidebuild.com",
  contractor_company: "Northside Build Co.",
  contractor_user_id: "preview-contractor-user",
  invitation_token: "preview-invitation-token",
  status: "submitted" as const,
  accepted_at: PREVIEW_TIMESTAMP,
  first_accessed_at: PREVIEW_TIMESTAMP,
  last_accessed_at: PREVIEW_TIMESTAMP,
  expires_at: "2026-12-31T23:59:59.000Z",
  created_at: PREVIEW_TIMESTAMP,
  updated_at: PREVIEW_TIMESTAMP,
  review: {
    id: "preview-review-1",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    invitation_id: PREVIEW_INVITATION_ID,
    notes:
      "Cabinet layout looks good. Recommend verifying existing electrical before adding under-cabinet lighting.",
    status: "submitted" as const,
    submitted_at: PREVIEW_TIMESTAMP,
    scope_snapshot: buildPreviewScopeSnapshot(previewHomeownerKitchenProject),
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
};

export const previewHomeownerReviewedScopes: ReviewedScopeSummary[] = [
  {
    invitation: previewInvitation,
    pending_suggestion_count: 1,
    total_suggestion_count: 2,
    proposal_min_total: 28500,
    proposal_max_total: 31200,
    estimate_status: "submitted",
    is_selected_proposal: false,
    project_has_selected_proposal: false,
    general_notes: previewInvitation.review?.notes ?? null,
  },
];

export const previewHomeownerActivity: ProjectActivityItem[] = [
  {
    id: "preview-activity-1",
    kind: "share_link_created",
    occurred_at: PREVIEW_TIMESTAMP,
    title: "Share link created",
    description: "Review link enabled for contractors.",
  },
  {
    id: "preview-activity-2",
    kind: "invitation_review_started",
    occurred_at: PREVIEW_TIMESTAMP,
    title: "Review started",
    description: "Maria Santos · Northside Build Co.",
    invitation_id: PREVIEW_INVITATION_ID,
    invitation: previewInvitation,
  },
  {
    id: "preview-activity-3",
    kind: "invitation_review_submitted",
    occurred_at: PREVIEW_TIMESTAMP,
    title: "Proposal submitted",
    description: "Maria Santos · Northside Build Co. — $28,500–$31,200",
    invitation_id: PREVIEW_INVITATION_ID,
    invitation: previewInvitation,
  },
];

export const previewHomeownerSuggestions: ScopeSuggestionWithMeta[] = [
  {
    id: "preview-suggestion-1",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    invitation_id: PREVIEW_INVITATION_ID,
    target_scope_item_id: "preview-scope-2",
    suggestion_type: "edit",
    category: "cabinetry",
    suggested_text:
      "Confirm ceiling height before ordering full-height uppers near the range.",
    contractor_note: "Existing soffit may limit cabinet height.",
    status: "pending",
    homeowner_rejection_reason: null,
    resolved_at: null,
    resolved_by: null,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
    contractor_name: "Maria Santos",
    target_scope_item_text: scopeItems[1].text,
  },
  {
    id: "preview-suggestion-2",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    invitation_id: PREVIEW_INVITATION_ID,
    target_scope_item_id: null,
    suggestion_type: "add",
    category: "electrical",
    suggested_text: "Add dedicated 20A circuit for microwave and range hood.",
    contractor_note: null,
    status: "follow_up_requested",
    homeowner_rejection_reason: null,
    resolved_at: null,
    resolved_by: null,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
    contractor_name: "Maria Santos",
    target_scope_item_text: null,
  },
];

export const previewHomeownerReviewedScopeDetail: ReviewedScopeDetail = {
  ...previewHomeownerReviewedScopes[0],
  suggestions: previewHomeownerSuggestions,
};

function daysAgoIso(days: number) {
  const date = new Date();
  date.setHours(16, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function getPreviewHomeownerSentInvitations(): ContractorInvitationWithReview[] {
  const sentAt = daysAgoIso(3);
  const openedAt = daysAgoIso(1);
  const expiresAt = "2026-12-31T23:59:59.000Z";

  const shareInvitation: ContractorInvitationWithReview = {
    id: PREVIEW_SHARE_INVITATION_ID,
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    invited_by: "preview-homeowner-user",
    contractor_name: SHARE_LINK_PLACEHOLDER_NAME,
    contractor_email: SHARE_LINK_PLACEHOLDER_EMAIL,
    contractor_company: null,
    invitation_token: PREVIEW_REVIEW_TOKEN,
    status: "pending",
    accepted_at: null,
    first_accessed_at: openedAt,
    last_accessed_at: openedAt,
    expires_at: expiresAt,
    created_at: sentAt,
    updated_at: openedAt,
  };

  const kurtInvitation: ContractorInvitationWithReview = {
    id: PREVIEW_KURT_INVITATION_ID,
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    invited_by: "preview-homeowner-user",
    contractor_name: "Kurt Blaiser",
    contractor_email: "kurt@example.com",
    contractor_company: null,
    invitation_token: "preview-kurt-token",
    status: "in_review",
    accepted_at: openedAt,
    first_accessed_at: openedAt,
    last_accessed_at: openedAt,
    expires_at: expiresAt,
    created_at: sentAt,
    updated_at: openedAt,
  };

  const juanInvitation: ContractorInvitationWithReview = {
    id: PREVIEW_JUAN_INVITATION_ID,
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    invited_by: "preview-homeowner-user",
    contractor_name: "Juan Numberjuan",
    contractor_email: "juan@example.com",
    contractor_company: null,
    invitation_token: "preview-juan-token",
    status: "submitted",
    accepted_at: openedAt,
    first_accessed_at: openedAt,
    last_accessed_at: openedAt,
    expires_at: expiresAt,
    created_at: sentAt,
    updated_at: openedAt,
    review: {
      id: "preview-juan-review",
      project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
      invitation_id: PREVIEW_JUAN_INVITATION_ID,
      notes: "Kitchen and bath bid attached.",
      status: "submitted",
      submitted_at: openedAt,
      scope_snapshot: null,
      created_at: sentAt,
      updated_at: openedAt,
    },
  };

  return [shareInvitation, kurtInvitation, juanInvitation];
}

export const previewKurtSuggestion: ScopeSuggestionWithMeta = {
  id: "preview-suggestion-kurt",
  project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
  invitation_id: PREVIEW_KURT_INVITATION_ID,
  target_scope_item_id: "preview-scope-2",
  suggestion_type: "note",
  category: "other",
  suggested_text: null,
  contractor_note:
    "Can the existing window stay in the kitchen, or should we plan to replace it with the new cabinetry?",
  status: "pending",
  homeowner_rejection_reason: null,
  resolved_at: null,
  resolved_by: null,
  created_at: PREVIEW_TIMESTAMP,
  updated_at: PREVIEW_TIMESTAMP,
  contractor_name: "Kurt Blaiser",
  target_scope_item_text: scopeItems[1].text,
};

export function getPreviewHomeownerOwnerSuggestions(): ScopeSuggestionWithMeta[] {
  return [...previewHomeownerSuggestions, previewKurtSuggestion];
}

export const previewHomeownerFollowUpQuestions: FollowUpQuestion[] = [
  {
    id: "preview-follow-up-timeline",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    question: "When are you looking to start?",
    question_type: "choice",
    category: "timeline",
    choices: ["Within 1 month", "1–3 months", "3–6 months", "Just exploring", "Not sure"],
    answer: "1–3 months",
    skipped: false,
    sort_order: 0,
    source: "homeowner",
    created_at: PREVIEW_TIMESTAMP,
    answered_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-follow-up-kitchen",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    question: "About how large is the kitchen?",
    question_type: "dimension_estimate",
    category: "dimensions",
    choices: null,
    answer: "exact:20x15",
    skipped: false,
    sort_order: 1,
    source: "ai",
    created_at: PREVIEW_TIMESTAMP,
    answered_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-follow-up-bath",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    question: "About how large is the guest bathroom?",
    question_type: "dimension_estimate",
    category: "dimensions",
    choices: null,
    answer: "exact:10x10",
    skipped: false,
    sort_order: 2,
    source: "ai",
    created_at: PREVIEW_TIMESTAMP,
    answered_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-follow-up-finishes",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    question: "What finish level are you aiming for?",
    question_type: "choice",
    category: "materials",
    choices: ["Standard finishes", "Elevated finishes", "Not sure"],
    answer: "Elevated finishes",
    skipped: false,
    sort_order: 3,
    source: "ai",
    created_at: PREVIEW_TIMESTAMP,
    answered_at: PREVIEW_TIMESTAMP,
  },
];

const PREVIEW_HOMEOWNER_PHOTO_URLS = [
  "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=800&h=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&h=800&q=80",
  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&h=800&q=80",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&h=800&q=80",
];

export const previewHomeownerPhotos: ProjectPhotoWithUrl[] = PREVIEW_HOMEOWNER_PHOTO_URLS.map(
  (url, index) => ({
    id: `preview-photo-${index + 1}`,
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    storage_path: `preview/photo-${index + 1}.jpg`,
    file_name: `project-photo-${index + 1}.jpg`,
    mime_type: "image/jpeg",
    file_size: 120_000,
    sort_order: index,
    created_at: PREVIEW_TIMESTAMP,
    url,
  })
);
