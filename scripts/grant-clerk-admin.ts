import { clerkClient } from "@clerk/nextjs/server";
import { isAdminEmail } from "@/lib/auth/admin-config";
import { grantClerkAdminIfAllowed } from "@/lib/auth/grant-clerk-admin";
import { createServiceClient } from "@/lib/db/supabase";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error("Usage: npx tsx scripts/grant-clerk-admin.ts admin@scopebuddy.ai");
    process.exit(1);
  }

  if (!isAdminEmail(email)) {
    console.error(
      `${email} is not in ADMIN_EMAILS. Add it to your environment first.`
    );
    process.exit(1);
  }

  const client = await clerkClient();
  const users = await client.users.getUserList({
    emailAddress: [email],
  });

  if (users.totalCount === 0) {
    console.log(
      `No Clerk user found for ${email}. Sign up first, then rerun this script.`
    );
    process.exit(0);
  }

  for (const user of users.data) {
    await grantClerkAdminIfAllowed(user.id, email);

    const supabase = createServiceClient();
    await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("id", user.id);

    console.log(`Granted admin privileges to ${email} (${user.id}).`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
