import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { isAdminEmail } from "@/lib/auth/admin-config";
import { grantClerkAdminIfAllowed } from "@/lib/auth/grant-clerk-admin";
import { createServiceClient } from "@/lib/db/supabase";

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email_addresses?: ClerkEmailAddress[];
    primary_email_address_id?: string | null;
  };
};

function resolveWebhookEmail(event: ClerkWebhookEvent) {
  return (
    event.data.email_addresses?.find(
      (entry) => entry.id === event.data.primary_email_address_id
    )?.email_address ?? event.data.email_addresses?.[0]?.email_address
  );
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 500 }
    );
  }

  const payload = await request.text();
  const headerStore = await headers();
  const svix = new Webhook(secret);

  let event: ClerkWebhookEvent;

  try {
    event = svix.verify(payload, {
      "svix-id": headerStore.get("svix-id") ?? "",
      "svix-timestamp": headerStore.get("svix-timestamp") ?? "",
      "svix-signature": headerStore.get("svix-signature") ?? "",
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (event.type === "user.created" || event.type === "user.updated") {
    const email = resolveWebhookEmail(event);

    if (!email) {
      return NextResponse.json({ received: true });
    }

    const name =
      [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") ||
      null;

    const isAdmin = isAdminEmail(email);

    if (isAdmin) {
      try {
        await grantClerkAdminIfAllowed(event.data.id, email);
      } catch (error) {
        console.error("Clerk admin metadata sync failed:", {
          clerkUserId: event.data.id,
          email,
          error,
        });
      }
    }

    const { error } = await supabase.from("users").upsert(
      {
        id: event.data.id,
        email,
        name,
        role: isAdmin ? "admin" : "homeowner",
      },
      { onConflict: "id" }
    );

    if (error) {
      if (isUniqueViolation(error)) {
        console.error("Clerk webhook email conflict:", {
          clerkUserId: event.data.id,
          email,
          error,
        });
        return NextResponse.json({ received: true });
      }

      console.error("Clerk webhook sync failed:", {
        eventType: event.type,
        clerkUserId: event.data.id,
        email,
        error,
      });
      return NextResponse.json({ error: "Failed to sync user." }, { status: 500 });
    }
  }

  if (event.type === "user.deleted") {
    const { error } = await supabase.from("users").delete().eq("id", event.data.id);
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
