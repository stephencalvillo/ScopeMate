import type { ContractorBidDetail } from "@/lib/contractor/bid-history";
import type { ContractorReviewListItem } from "@/lib/contractor/review-list-item";
import type { ProjectReadinessSummary } from "@/lib/project/readiness-summary";
import type {
  ContractorEstimate,
  ContractorProfile,
  ContractorRateItem,
  ProjectWithScope,
  ScopeItem,
} from "@/types";
import { previewHomeownerKitchenProject } from "./homeowner";
import {
  PREVIEW_CONTRACTOR_PROJECT_ID,
  PREVIEW_HOMEOWNER_PROJECT_ID,
  PREVIEW_INVITATION_ID,
  PREVIEW_REVIEW_TOKEN,
  PREVIEW_TIMESTAMP,
} from "./constants";
import { buildPreviewScopeSnapshot } from "./scope-snapshot";

export const previewContractorProfile: ContractorProfile = {
  user_id: "preview-contractor-user",
  company_name: "Northside Build Co.",
  contact_name: "Maria Santos",
  service_area: "Austin metro",
  phone: "(512) 555-0142",
  onboarding_completed_at: PREVIEW_TIMESTAMP,
  created_at: PREVIEW_TIMESTAMP,
  updated_at: PREVIEW_TIMESTAMP,
};

const contractorScopeItems: ScopeItem[] = [
  {
    id: "preview-contractor-scope-1",
    project_id: PREVIEW_CONTRACTOR_PROJECT_ID,
    category: "demolition",
    text: "Remove existing vanity, toilet, and floor tile.",
    source: "contractor",
    priority: "required",
    status: "active",
    sort_order: 0,
    needs_verification: false,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-contractor-scope-2",
    project_id: PREVIEW_CONTRACTOR_PROJECT_ID,
    category: "fixtures",
    text: "Install new vanity, faucet, and mirror.",
    source: "contractor",
    priority: "required",
    status: "active",
    sort_order: 1,
    needs_verification: false,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
];

export const previewContractorClientProject: ProjectWithScope = {
  id: PREVIEW_CONTRACTOR_PROJECT_ID,
  homeowner_id: null,
  creator_role: "contractor",
  created_by_user_id: "preview-contractor-user",
  title: "Powell bathroom refresh",
  project_type: "bathroom",
  city: "Round Rock",
  zip: "78664",
  location: "Round Rock, TX 78664",
  original_description: "Update guest bath with new vanity and tile flooring.",
  ai_summary: "Bathroom refresh with demo, new vanity package, and tile floor.",
  status: "scope_ready",
  share_token: null,
  share_enabled: false,
  share_expires_at: null,
  created_at: PREVIEW_TIMESTAMP,
  updated_at: PREVIEW_TIMESTAMP,
  scope_items: contractorScopeItems,
};

const reviewListItem: ContractorReviewListItem = {
  invitation: {
    id: PREVIEW_INVITATION_ID,
    project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
    invited_by: "preview-homeowner-user",
    contractor_name: "Maria Santos",
    contractor_email: "maria@northsidebuild.com",
    contractor_company: "Northside Build Co.",
    contractor_user_id: "preview-contractor-user",
    invitation_token: "preview-invitation-token",
    status: "submitted",
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
      notes: "Recommend verifying existing electrical before adding under-cabinet lighting.",
      status: "submitted",
      submitted_at: PREVIEW_TIMESTAMP,
      scope_snapshot: buildPreviewScopeSnapshot(previewHomeownerKitchenProject),
      created_at: PREVIEW_TIMESTAMP,
      updated_at: PREVIEW_TIMESTAMP,
    },
    review_url: `/review/${PREVIEW_REVIEW_TOKEN}`,
  },
  project: {
    id: previewHomeownerKitchenProject.id,
    title: previewHomeownerKitchenProject.title,
    city: previewHomeownerKitchenProject.city,
    zip: previewHomeownerKitchenProject.zip,
    location: previewHomeownerKitchenProject.location,
    project_type: previewHomeownerKitchenProject.project_type,
    accepted_estimate_id: null,
    ai_summary: previewHomeownerKitchenProject.ai_summary,
    original_description: previewHomeownerKitchenProject.original_description,
  },
  review_url: `/review/${PREVIEW_REVIEW_TOKEN}`,
  proposal_range: "$28,500–$31,200",
  estimate_status: "submitted",
  estimate_id: "preview-estimate-1",
  estimate_submitted_at: PREVIEW_TIMESTAMP,
  is_selected_proposal: false,
  project_has_selected_proposal: false,
};

export const previewContractorDashboard = {
  clientProjects: [previewContractorClientProject],
  accepted: [] as ContractorReviewListItem[],
  inReview: [reviewListItem],
  history: [] as ContractorReviewListItem[],
};

const previewEstimate: ContractorEstimate = {
  id: "preview-estimate-1",
  project_id: PREVIEW_HOMEOWNER_PROJECT_ID,
  review_id: "preview-review-1",
  invitation_id: PREVIEW_INVITATION_ID,
  status: "submitted",
  total: 29850,
  submitted_at: PREVIEW_TIMESTAMP,
  created_at: PREVIEW_TIMESTAMP,
  updated_at: PREVIEW_TIMESTAMP,
  line_items: [
    {
      id: "preview-line-1",
      estimate_id: "preview-estimate-1",
      scope_item_id: "preview-scope-1",
      description: "Demo and disposal",
      labor_cost: 1800,
      material_cost: 250,
      total: 2050,
      sort_order: 0,
      created_at: PREVIEW_TIMESTAMP,
      updated_at: PREVIEW_TIMESTAMP,
    },
    {
      id: "preview-line-2",
      estimate_id: "preview-estimate-1",
      scope_item_id: "preview-scope-2",
      description: "Cabinet supply and install",
      labor_cost: 6200,
      material_cost: 9800,
      total: 16000,
      sort_order: 1,
      created_at: PREVIEW_TIMESTAMP,
      updated_at: PREVIEW_TIMESTAMP,
    },
  ],
};

export const previewContractorBidDetail: ContractorBidDetail = {
  item: reviewListItem,
  project: previewHomeownerKitchenProject,
  estimate: previewEstimate,
  photos: [],
};

export const previewContractorRates: ContractorRateItem[] = [
  {
    id: "preview-rate-1",
    contractor_user_id: "preview-contractor-user",
    category: "demolition",
    label: "Demolition",
    labor_cost: 85,
    material_cost: 15,
    sort_order: 0,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
  {
    id: "preview-rate-2",
    contractor_user_id: "preview-contractor-user",
    category: "cabinetry",
    label: "Cabinetry",
    labor_cost: 120,
    material_cost: 250,
    sort_order: 1,
    created_at: PREVIEW_TIMESTAMP,
    updated_at: PREVIEW_TIMESTAMP,
  },
];

const readiness: ProjectReadinessSummary = {
  target_start: "2026-08-01",
  location: "Austin, TX 78701",
  finish_level: "mid",
  photos: {
    current: 2,
    inspiration: 1,
    total: 3,
  },
};

export const previewReviewShareLinkPayload = {
  invitation: reviewListItem.invitation,
  review: reviewListItem.invitation.review!,
  project: previewHomeownerKitchenProject,
  photos: [],
  readiness,
  suggestions: [],
  estimate: previewEstimate,
  can_edit: true,
  is_share_link: true,
  is_contractor_client_project: false,
  homeowner_name: "Alex Chen",
};
