import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminPanelChrome } from "@/components/admin/admin-panel-chrome";
import { ScreenCatalogOverview } from "@/components/admin/screen-catalog-overview";
import { requireAdminPage } from "@/lib/admin/require-admin-page";

export default async function AdminScreensPage() {
  const access = await requireAdminPage();

  if (!access.ok) {
    return <AdminAccessDenied message={access.message} />;
  }

  return (
    <AdminPanelChrome title="Screen catalog">
      <ScreenCatalogOverview />
    </AdminPanelChrome>
  );
}
