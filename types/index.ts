export type UserRole = "homeowner" | "contractor" | "admin";

export type ProjectStatus = "draft" | "scope_ready" | "shared" | "archived";

export type ScopeItemSource = "ai" | "homeowner" | "contractor";

export type ScopeItemPriority = "required" | "recommended" | "optional";

export type ScopeItemStatus = "active" | "removed";

export type EstimateStatus = "draft" | "submitted";

export interface EstimateLineItem {
  id: string;
  estimate_id: string;
  scope_item_id: string | null;
  description: string;
  labor_cost: number;
  material_cost: number;
  total: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContractorEstimate {
  id: string;
  project_id: string;
  review_id: string;
  invitation_id: string;
  status: EstimateStatus;
  total: number;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  line_items?: EstimateLineItem[];
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Project {
  id: string;
  homeowner_id: string;
  title: string;
  project_type: string;
  city: string;
  zip: string;
  location: string | null;
  original_description: string;
  ai_summary: string | null;
  status: ProjectStatus;
  share_token: string | null;
  share_enabled: boolean;
  share_expires_at: string | null;
  share_enabled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScopeItem {
  id: string;
  project_id: string;
  category: string;
  text: string;
  source: ScopeItemSource;
  priority: ScopeItemPriority;
  status: ScopeItemStatus;
  sort_order: number;
  needs_verification: boolean;
  follow_up_question_id?: string | null;
  suggestion_id?: string | null;
  contractor_attribution_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithScope extends Project {
  scope_items: ScopeItem[];
}

export interface AiScopeItem {
  category: string;
  text: string;
  priority: ScopeItemPriority;
  needs_verification: boolean;
}

export interface AiScopeOutput {
  ai_summary: string;
  project_type: string;
  suggested_title?: string;
  scope_items: AiScopeItem[];
}

export interface AiRunInputSnapshot {
  prompt_version: string;
  model: string;
  user_prompt: string;
  system_prompt: string;
  project: {
    id: string;
    title: string;
    project_type: string;
    location: string;
    city: string;
    zip: string;
    original_description: string;
  };
}

export interface AiRunOutputSnapshot {
  parsed: AiScopeOutput;
  raw_content: string;
  finish_reason: string | null;
}

export interface AiRun {
  id: string;
  project_id: string;
  prompt_version: string;
  model: string;
  input_snapshot: AiRunInputSnapshot;
  output_snapshot: AiRunOutputSnapshot;
  created_at: string;
}

export interface GenerateScopeResult {
  ai_run_id: string;
  prompt_version: string;
  input_snapshot: AiRunInputSnapshot;
  output_snapshot: AiRunOutputSnapshot;
  ai_summary: string;
  project_type: string;
  suggested_title?: string;
  scope_items: ScopeItem[];
  follow_up_questions?: FollowUpQuestion[];
}

export type FollowUpQuestionType = "text" | "choice" | "dimension_estimate";

export type FollowUpQuestionCategory =
  | "dimensions"
  | "materials"
  | "timeline"
  | "permits"
  | "trade_scope"
  | "other";

export interface FollowUpQuestion {
  id: string;
  project_id: string;
  question: string;
  question_type: FollowUpQuestionType;
  category: FollowUpQuestionCategory;
  choices: string[] | null;
  answer: string | null;
  skipped: boolean;
  sort_order: number;
  source: "ai" | "homeowner";
  created_at: string;
  answered_at: string | null;
}

export interface ProjectPhoto {
  id: string;
  project_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  sort_order: number;
  created_at: string;
}

export interface AiFollowUpQuestion {
  question: string;
  question_type: FollowUpQuestionType;
  category: FollowUpQuestionCategory;
  choices: string[] | null;
}

export interface AiFollowUpOutput {
  questions: AiFollowUpQuestion[];
}

export interface AiFollowUpOutput {
  questions: AiFollowUpQuestion[];
}

export type ContractorInvitationStatus =
  | "pending"
  | "in_review"
  | "submitted"
  | "revoked"
  | "expired";

export type ContractorReviewStatus = "in_progress" | "submitted";

export type ScopeSuggestionType = "add" | "edit" | "remove" | "note";

export interface ReviewScopeSnapshotItem {
  id: string;
  category: string;
  text: string;
  source: ScopeItemSource;
  priority: ScopeItemPriority;
  sort_order: number;
  needs_verification: boolean;
  contractor_attribution_name?: string | null;
  suggestion_id?: string | null;
}

export interface ReviewScopeSnapshotSuggestion {
  id: string;
  suggestion_type: ScopeSuggestionType;
  category: string | null;
  suggested_text: string | null;
  contractor_note: string | null;
  target_scope_item_id: string | null;
}

export interface ReviewScopeSnapshot {
  captured_at: string;
  ai_summary: string | null;
  scope_items: ReviewScopeSnapshotItem[];
  suggestions: ReviewScopeSnapshotSuggestion[];
}

export type ScopeSuggestionStatus =
  | "draft"
  | "pending"
  | "follow_up_requested"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type SuggestionFollowUpAuthorRole = "homeowner" | "contractor";

export interface ContractorInvitation {
  id: string;
  project_id: string;
  invited_by: string;
  contractor_name: string;
  contractor_email: string;
  contractor_company: string | null;
  invitation_token: string;
  status: ContractorInvitationStatus;
  accepted_at: string | null;
  first_accessed_at: string | null;
  last_accessed_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContractorInvitationWithReview extends ContractorInvitation {
  review?: ContractorReview | null;
  review_url?: string;
}

export interface ContractorReview {
  id: string;
  project_id: string;
  invitation_id: string;
  notes: string | null;
  status: ContractorReviewStatus;
  submitted_at: string | null;
  scope_snapshot: ReviewScopeSnapshot | null;
  created_at: string;
  updated_at: string;
}

export interface ScopeSuggestion {
  id: string;
  project_id: string;
  invitation_id: string;
  target_scope_item_id: string | null;
  suggestion_type: ScopeSuggestionType;
  category: string | null;
  suggested_text: string | null;
  contractor_note: string | null;
  status: ScopeSuggestionStatus;
  homeowner_rejection_reason: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SuggestionFollowUp {
  id: string;
  suggestion_id: string;
  author_role: SuggestionFollowUpAuthorRole;
  message: string;
  created_at: string;
}

export interface ScopeSuggestionWithMeta extends ScopeSuggestion {
  contractor_name?: string;
  follow_ups?: SuggestionFollowUp[];
  target_scope_item_text?: string | null;
}

export const CONTRACTOR_INVITATION_STATUS_LABELS: Record<
  ContractorInvitationStatus,
  string
> = {
  pending: "Waiting for review",
  in_review: "Review in progress",
  submitted: "Review submitted",
  revoked: "Revoked",
  expired: "Expired",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  scope_ready: "Scope ready",
  shared: "Shared",
  archived: "Archived",
};

export const SCOPE_CATEGORIES = [
  "demolition",
  "structural",
  "plumbing",
  "electrical",
  "hvac",
  "carpentry",
  "drywall",
  "flooring",
  "tile",
  "painting",
  "fixtures",
  "permits",
  "cleanup",
  "other",
] as const;

export function formatProjectTypeLabel(projectType: string): string {
  if (!projectType || projectType === "unspecified") {
    return "Construction project";
  }
  return projectType;
}
