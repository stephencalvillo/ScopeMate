import { notFound } from "next/navigation";
import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminPanelChrome } from "@/components/admin/admin-panel-chrome";
import { ScreenCatalogGallery } from "@/components/admin/screen-catalog-gallery";
import { requireAdminPage } from "@/lib/admin/require-admin-page";
import {
  getScreensByAudience,
  isScreenAudience,
} from "@/lib/admin/screen-catalog";

export default async function AdminScreensAudiencePage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const access = await requireAdminPage();

  if (!access.ok) {
    return <AdminAccessDenied message={access.message} />;
  }

  const { audience } = await params;

  if (!isScreenAudience(audience)) {
    notFound();
  }

  const screens = getScreensByAudience(audience);

  return (
    <AdminPanelChrome
      title="Screen catalog"
      backHref="/adminpanel/screens"
      backLabel="All audiences"
    >
      <ScreenCatalogGallery audience={audience} screens={screens} />
    </AdminPanelChrome>
  );
}
