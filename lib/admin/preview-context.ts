export type ProjectPreviewContext = {
  detailPath: string;
  apiBasePath: string;
};

export function getProjectPreviewContext(screenId: string): ProjectPreviewContext {
  return {
    detailPath: `/adminpanel/preview/${screenId}`,
    apiBasePath: `/api/admin/preview/projects/${screenId}`,
  };
}
