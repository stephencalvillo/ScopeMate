import { redirect } from "next/navigation";
import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminStats } from "@/lib/admin/stats";
import { ForbiddenError, resolveClerkUserIdFromHeaders } from "@/lib/auth/clerk";
import { isAdminConfigured, requireAdmin } from "@/lib/auth/admin";
import { auth } from "@clerk/nextjs/server";

export default async function AdminPanelPage() {
  const { userId: authUserId } = await auth();
  const userId = authUserId ?? (await resolveClerkUserIdFromHeaders());

  if (!userId) {
    redirect("/sign-in?redirect_url=%2Fadminpanel");
  }

  if (!isAdminConfigured()) {
    return (
      <AdminAccessDenied message="Admin access is not configured yet. Add your email to ADMIN_EMAILS in the environment settings." />
    );
  }

  try {
    const admin = await requireAdmin();
    const stats = await getAdminStats();

    return (
      <AdminShell
        stats={stats}
        adminEmail={admin.email}
        adminUserId={admin.userId}
      />
    );
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return <AdminAccessDenied message={error.message} />;
    }

    console.error("Admin panel failed to load:", error);

    return (
      <AdminAccessDenied message="Unable to load the admin dashboard. Try refreshing the page. If delete was in progress, the user may still have been removed." />
    );
  }
}
