import { notFound } from "next/navigation";
import { AdminPreviewScreen } from "@/components/admin/preview/admin-preview-screen";
import { getScreenById } from "@/lib/admin/screen-catalog";
import { requireAdminPreviewPage } from "@/lib/admin/require-admin-page";

export default async function AdminPreviewPage({
  params,
}: {
  params: Promise<{ screenId: string }>;
}) {
  const { screenId } = await params;
  await requireAdminPreviewPage(screenId);

  const screen = getScreenById(screenId);

  if (!screen) {
    notFound();
  }

  return <AdminPreviewScreen screen={screen} />;
}
