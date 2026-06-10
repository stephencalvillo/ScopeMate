import { auth } from "@clerk/nextjs/server";
import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSignIn } from "@/components/admin/admin-sign-in";
import { getAdminStats } from "@/lib/admin/stats";
import { ForbiddenError } from "@/lib/auth/clerk";
import { isAdminConfigured, requireAdmin } from "@/lib/auth/admin";

export default async function AdminPanelPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-[var(--page-padding-x)] py-12">
        <AdminSignIn />
      </div>
    );
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

    throw error;
  }
}
