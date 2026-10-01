export type ProjectPreviewContext = {
  detailPath: string;
  apiBasePath: string;
  listPath: string;
};

export function getProjectPreviewContext(screenId: string): ProjectPreviewContext {
  return {
    detailPath: `/adminpanel/preview/${screenId}`,
    apiBasePath: `/api/admin/preview/projects/${screenId}`,
    listPath: screenId.startsWith("contractor")
      ? "/adminpanel/preview/contractor-dashboard"
      : "/adminpanel/preview/homeowner-projects-list",
  };
}
