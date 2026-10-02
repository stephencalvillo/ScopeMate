import { notFound } from "next/navigation";
import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminPanelChrome } from "@/components/admin/admin-panel-chrome";
import { ScreenCatalogGallery } from "@/components/admin/screen-catalog-gallery";
import { requireAdminPage } from "@/lib/admin/require-admin-page";
import {
  getScreensByAudience,
  isScreenAudience,
  type ScreenAudience,
} from "@/lib/admin/screen-catalog";

const flowTitles: Record<ScreenAudience, string> = {
  homeowner: "Homeowner flow",
  contractor: "Contractor flow",
};

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
      title={flowTitles[audience]}
      subtitle="Click a screen to view it on the right. The map stays open, so you can switch screens without closing the preview."
      backHref="/adminpanel/screens"
      backLabel="All audiences"
      contentLayout="canvas"
    >
      <ScreenCatalogGallery audience={audience} screens={screens} />
    </AdminPanelChrome>
  );
}
