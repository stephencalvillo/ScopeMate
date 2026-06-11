export type ScreenAudience = "homeowner" | "contractor";

export type ScreenCatalogEntry = {
  id: string;
  audience: ScreenAudience;
  title: string;
  description: string;
  productionPath: string;
  category: string;
};

export const SCREEN_CATALOG: ScreenCatalogEntry[] = [
  {
    id: "homeowner-projects-list",
    audience: "homeowner",
    title: "Projects list",
    description: "Dashboard of all homeowner projects.",
    productionPath: "/projects",
    category: "Dashboard",
  },
  {
    id: "homeowner-projects-new",
    audience: "homeowner",
    title: "New project",
    description: "Create a project from a plain-language description.",
    productionPath: "/projects/new",
    category: "Project creation",
  },
  {
    id: "homeowner-project-detail",
    audience: "homeowner",
    title: "Project detail",
    description:
      "Scope editor, share, activity, reviewed scopes, and needs attention tabs.",
    productionPath: "/projects/[id]",
    category: "Project workspace",
  },
  {
    id: "homeowner-project-setup",
    audience: "homeowner",
    title: "Post-signup setup",
    description: "Loading state after signup while a guest project is claimed.",
    productionPath: "/projects/[id]/setup",
    category: "Onboarding",
  },
  {
    id: "homeowner-project-review",
    audience: "homeowner",
    title: "Reviewed scope detail",
    description: "Homeowner view of a contractor proposal and suggestions.",
    productionPath: "/projects/[id]/reviews/[invitationId]",
    category: "Proposals",
  },
  {
    id: "contractor-dashboard",
    audience: "contractor",
    title: "My projects",
    description: "Active client projects, in-review jobs, and bid history.",
    productionPath: "/contractor",
    category: "Dashboard",
  },
  {
    id: "contractor-projects-new",
    audience: "contractor",
    title: "New client project",
    description: "Contractor-initiated client project creation.",
    productionPath: "/contractor/projects/new",
    category: "Project creation",
  },
  {
    id: "contractor-project-detail",
    audience: "contractor",
    title: "Client project detail",
    description: "Contractor view of a client project with scope tabs.",
    productionPath: "/contractor/projects/[id]",
    category: "Project workspace",
  },
  {
    id: "contractor-bid-detail",
    audience: "contractor",
    title: "Bid detail",
    description: "Submitted estimate and project snapshot from bid history.",
    productionPath: "/contractor/bids/[invitationId]",
    category: "Bids",
  },
  {
    id: "contractor-business",
    audience: "contractor",
    title: "Business info",
    description: "Company profile and service area settings.",
    productionPath: "/contractor/business",
    category: "Settings",
  },
  {
    id: "contractor-rates",
    audience: "contractor",
    title: "Saved rates",
    description: "Default labor and material rates by scope category.",
    productionPath: "/contractor/rates",
    category: "Settings",
  },
  {
    id: "contractor-onboarding",
    audience: "contractor",
    title: "Contractor onboarding",
    description: "Initial profile setup before entering the portal.",
    productionPath: "/contractor/onboarding",
    category: "Onboarding",
  },
  {
    id: "contractor-complete-setup",
    audience: "contractor",
    title: "Complete setup",
    description: "Post-signup loading state while contractor access is finalized.",
    productionPath: "/contractor/complete-setup",
    category: "Onboarding",
  },
  {
    id: "contractor-review-share-link",
    audience: "contractor",
    title: "Share-link review",
    description: "Contractor workspace opened from a homeowner share link.",
    productionPath: "/review/[token]",
    category: "Review flow",
  },
];

const catalogById = new Map(SCREEN_CATALOG.map((screen) => [screen.id, screen]));

/** Keep in sync with app routes — verified by `npm run check:screen-catalog`. */

export function getScreensByAudience(audience: ScreenAudience) {
  return SCREEN_CATALOG.filter((screen) => screen.audience === audience);
}

export function getScreenById(screenId: string) {
  return catalogById.get(screenId);
}

export function getPreviewPath(screenId: string) {
  return `/adminpanel/preview/${screenId}`;
}

export function countScreensByAudience(audience: ScreenAudience) {
  return getScreensByAudience(audience).length;
}

export function isScreenAudience(value: string): value is ScreenAudience {
  return value === "homeowner" || value === "contractor";
}
