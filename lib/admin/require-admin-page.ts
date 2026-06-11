import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ForbiddenError } from "@/lib/auth/clerk";
import { isAdminConfigured, requireAdmin } from "@/lib/auth/admin";

export async function requireAdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/adminpanel");
  }

  if (!isAdminConfigured()) {
    return {
      ok: false as const,
      message:
        "Admin access is not configured yet. Add your email to ADMIN_EMAILS in the environment settings.",
    };
  }

  try {
    const admin = await requireAdmin();
    return { ok: true as const, admin };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return { ok: false as const, message: error.message };
    }

    throw error;
  }
}

export async function requireAdminPreviewPage(screenId: string) {
  const access = await requireAdminPage();

  if (!access.ok) {
    notFound();
  }

  return access.admin;
}
