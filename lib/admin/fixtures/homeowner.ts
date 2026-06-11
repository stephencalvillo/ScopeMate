import type { ProjectActivityItem } from "@/lib/contractor/activity";
import type { ReviewedScopeDetail } from "@/lib/contractor/reviewed-scopes";
import type { ReviewedScopeSummary } from "@/lib/contractor/reviewed-scopes";
import type {
  Project,
  ProjectWithScope,
  ScopeItem,
  ScopeSuggestionWithMeta,
} from "@/types";
import {
  PREVIEW_HOMEOWNER_PROJECT_ID,
  PREVIEW_INVITATION_ID,
  PREVIEW_REVIEW_TOKEN,
  PREVIEW_TIMESTAMP,
} from "./constants";
import { buildPreviewScopeSnapshot } from "./scope-snapshot";

const scopeItems: ScopeItem[] = [
  {
    id: "preview-scope-1",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    category: "demolition",
    text: "Remove existing upper and lower cabinets, countertop, and backsplash tile.",
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
    category: "cabinetry",
    text: "Install shaker-style cabinets with soft-close hinges and drawer slides.",
    source: "ai",
    priority: "required",
    status: "active",
    sort_order: 1,
    needs_verification: true,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-scope-3",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    category: "countertops",
    text: "Template and install quartz countertops with eased edge profile.",
    source: "ai",
    priority: "recommended",
    status: "active",
    sort_order: 2,
    needs_verification: false,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-scope-4",
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    category: "fixtures",
    text: "Install under-cabinet LED lighting and replace outlet covers.",
    source: "homeowner",
    priority: "optional",
    status: "active",
    sort_order: 3,
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
  title: "Kitchen refresh",
  project_type: "kitchen",
  city: "Austin",
  zip: "78701",
  location: "Austin, TX 78701",
  original_description:
    "We want to update our kitchen with new cabinets, quartz counters, and better lighting.",
  ai_summary:
    "Full kitchen refresh including demo, new shaker cabinets, quartz counters, and upgraded lighting.",
  status: "scope_ready",
  share_token: PREVIEW_REVIEW_TOKEN,
  share_enabled: true,
  share_expires_at: null,
  share_enabled_at: PREVIEW_TIMESTAMP,
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
