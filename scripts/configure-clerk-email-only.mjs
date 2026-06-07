#!/usr/bin/env node

const secretKey = process.env.CLERK_SECRET_KEY?.trim();

if (!secretKey) {
  console.error("Missing CLERK_SECRET_KEY.");
  console.error(
    "Run with your production secret, e.g. CLERK_SECRET_KEY=sk_live_... node scripts/configure-clerk-email-only.mjs"
  );
  process.exit(1);
}

const instancePrefix = secretKey.startsWith("sk_live_") ? "production" : "development";

async function clerkFetch(path, options = {}) {
  const response = await fetch(`https://api.clerk.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Keep raw text for non-JSON responses.
  }

  return { response, body };
}

async function main() {
  console.log(`Configuring Clerk ${instancePrefix} instance for email-only signup...`);

  const { response: instanceResponse, body: instance } = await clerkFetch(
    "/v1/instance"
  );

  if (!instanceResponse.ok) {
    console.error("Could not read Clerk instance:", instance);
    process.exit(1);
  }

  console.log(`Instance: ${instance.id} (${instance.environment_type})`);

  const { response, body } = await clerkFetch("/v1/beta_features/instance_settings", {
    method: "PATCH",
    body: JSON.stringify({
      progressive_sign_up: true,
      attributes: {
        email_address: {
          enabled: true,
          required: true,
          used_for_first_factor: true,
          verify_at_sign_up: true,
        },
        phone_number: {
          enabled: false,
          required: false,
          used_for_first_factor: false,
          used_for_second_factor: false,
          verify_at_sign_up: false,
        },
      },
    }),
  });

  if (!response.ok) {
    console.error("Clerk API update failed:", body);
    process.exit(1);
  }

  console.log("Submitted email-only settings to Clerk.");
  console.log("");
  console.log("Verify in Clerk Dashboard → Configure → User & authentication:");
  console.log("  • Email address: required");
  console.log("  • Phone number: disabled / not required");
  console.log("");
  console.log(
    "If phone is still shown on https://myscopemate.ai/sign-up, finish the change in the Dashboard for the production instance."
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
