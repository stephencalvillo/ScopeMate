import type { ScreenAudience } from "@/lib/admin/screen-catalog";

export type ScreenFlowNode = {
  screenId: string;
  column: number;
  row: number;
};

export type ScreenFlowEdge = {
  from: string;
  to: string;
};

type ScreenFlow = {
  nodes: ScreenFlowNode[];
  edges: ScreenFlowEdge[];
};

function edges(pairs: Array<[string, string]>): ScreenFlowEdge[] {
  return pairs.map(([from, to]) => ({ from, to }));
}

/**
 * Primary journeys for the admin flow map.
 * Row 0 is the main path. Later rows are side entries and branches.
 */
export const SCREEN_FLOWS: Record<ScreenAudience, ScreenFlow> = {
  homeowner: {
    nodes: [
      { screenId: "homeowner-project-setup", column: 0, row: 0 },
      { screenId: "homeowner-projects-list", column: 1, row: 0 },
      { screenId: "homeowner-projects-new", column: 2, row: 0 },
      { screenId: "homeowner-project-detail", column: 3, row: 0 },
      { screenId: "homeowner-project-review", column: 4, row: 0 },
    ],
    edges: edges([
      ["homeowner-project-setup", "homeowner-projects-list"],
      ["homeowner-projects-list", "homeowner-projects-new"],
      ["homeowner-projects-new", "homeowner-project-detail"],
      ["homeowner-project-detail", "homeowner-project-review"],
    ]),
  },
  contractor: {
    nodes: [
      { screenId: "contractor-onboarding", column: 0, row: 0 },
      { screenId: "contractor-complete-setup", column: 1, row: 0 },
      { screenId: "contractor-dashboard", column: 2, row: 0 },
      { screenId: "contractor-projects-new", column: 3, row: 0 },
      { screenId: "contractor-project-detail", column: 4, row: 0 },
      { screenId: "contractor-review-share-link", column: 0, row: 1 },
      { screenId: "contractor-bid-detail", column: 2, row: 1 },
      { screenId: "contractor-business", column: 3, row: 1 },
      { screenId: "contractor-rates", column: 4, row: 1 },
    ],
    edges: edges([
      ["contractor-onboarding", "contractor-complete-setup"],
      ["contractor-review-share-link", "contractor-complete-setup"],
      ["contractor-complete-setup", "contractor-dashboard"],
      ["contractor-dashboard", "contractor-projects-new"],
      ["contractor-projects-new", "contractor-project-detail"],
      ["contractor-dashboard", "contractor-bid-detail"],
      ["contractor-dashboard", "contractor-business"],
      ["contractor-dashboard", "contractor-rates"],
    ]),
  },
};

export function getScreenFlowLayout(
  audience: ScreenAudience,
  screenIds: string[]
) {
  const flow = SCREEN_FLOWS[audience];
  const known = new Set(screenIds);
  const nodes = flow.nodes.filter((node) => known.has(node.screenId));
  const placed = new Set(nodes.map((node) => node.screenId));
  const maxRow = nodes.reduce((highest, node) => Math.max(highest, node.row), 0);
  const extras = screenIds.filter((screenId) => !placed.has(screenId));

  extras.forEach((screenId, index) => {
    nodes.push({
      screenId,
      column: index,
      row: maxRow + 2,
    });
  });

  const edgesForLayout = flow.edges.filter(
    (edge) => placed.has(edge.from) && placed.has(edge.to)
  );

  const columnCount =
    nodes.reduce((highest, node) => Math.max(highest, node.column), 0) + 1;
  const rowCount =
    nodes.reduce((highest, node) => Math.max(highest, node.row), 0) + 1;

  return {
    nodes,
    edges: edgesForLayout,
    columnCount,
    rowCount,
    hasUnplacedScreens: extras.length > 0,
  };
}
