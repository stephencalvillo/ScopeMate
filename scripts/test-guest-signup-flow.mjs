#!/usr/bin/env node
/**
 * Smoke test for guest project creation + setup route availability.
 *
 * Usage:
 *   node scripts/test-guest-signup-flow.mjs
 *   BASE_URL=https://scopebuddy.ai node scripts/test-guest-signup-flow.mjs
 */

const baseUrl = (process.env.BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { response, json, text };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  console.log(`Testing guest signup flow against ${baseUrl}`);

  const guest = await request("/api/projects/guest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      original_description:
        "Automated smoke test: kitchen remodel with new cabinets, counters, and lighting in Austin.",
      zip: "78701",
    }),
  });

  assert(
    guest.response.ok,
    `Guest project creation failed (${guest.response.status}): ${guest.text}`
  );

  const projectId = guest.json?.id ?? guest.json?.project?.id;
  const guestToken =
    guest.json?.guest_access_token ?? guest.json?.project?.guest_access_token;

  assert(typeof projectId === "string", "Guest project response missing id.");
  assert(
    typeof guestToken === "string",
    "Guest project response missing guest_access_token."
  );

  console.log(`Created guest project ${projectId}`);

  const cookie = guest.response.headers.get("set-cookie") ?? "";
  assert(
    cookie.includes("scopemate_guest_project"),
    "Guest project cookie was not set."
  );

  const projectPage = await request(`/projects/${projectId}`, {
    headers: { cookie },
  });
  assert(
    projectPage.response.ok,
    `Project page failed to render (${projectPage.response.status}).`
  );
  assert(
    !projectPage.text.includes("Could not load project"),
    "Project page rendered client fallback error state."
  );

  const setupPage = await request(`/projects/${projectId}/setup`, {
    headers: { cookie },
  });
  assert(
    setupPage.response.ok,
    `Setup page failed to render (${setupPage.response.status}).`
  );
  assert(
    setupPage.text.includes("Welcome to ScopeBuddy") ||
      setupPage.text.includes("Finishing your account setup"),
    "Setup page did not include expected loading copy."
  );

  const photosApi = await request(`/api/projects/${projectId}/photos`, {
    headers: { cookie },
  });
  assert(
    photosApi.response.ok,
    `Photos API failed for guest project (${photosApi.response.status}): ${photosApi.text}`
  );

  console.log("Guest signup flow smoke test passed.");
  console.log(`Manual browser check: ${baseUrl}/projects/${projectId}/setup?share=1&guest_token=${guestToken}`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
