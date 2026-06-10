#!/usr/bin/env node
/**
 * Read-only audit for Clerk + Vercel production configuration.
 * Does not print secret values.
 *
 * Usage:
 *   node scripts/check-clerk-vercel-env.mjs
 *   BASE_URL=https://scopebuddy.ai node scripts/check-clerk-vercel-env.mjs
 */

const baseUrl = (process.env.BASE_URL ?? "https://scopebuddy.ai").replace(
  /\/$/,
  ""
);

async function check(name, ok, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

async function main() {
  console.log(`Checking Clerk/Vercel config for ${baseUrl}\n`);

  let passed = 0;
  let total = 0;

  const signUpHtml = await fetch(`${baseUrl}/sign-up`).then((r) => r.text());
  const pkMatches = signUpHtml.match(/pk_(live|test)_[A-Za-z0-9_-]+/g) ?? [];
  const pkType = pkMatches[0]?.startsWith("pk_live_") ? "live" : pkMatches[0]?.startsWith("pk_test_") ? "test" : "unknown";
  total++;
  if (await check("Publishable key on site", pkType === "live", pkType === "live" ? "pk_live_*" : `found ${pkType}`)) passed++;

  const proxyHead = await fetch(`${baseUrl}/__clerk/v1/client`, { method: "GET" }).catch(() => null);
  total++;
  if (
    await check(
      "Clerk frontend proxy",
      Boolean(proxyHead && (proxyHead.status === 200 || proxyHead.status === 401 || proxyHead.status === 405)),
      proxyHead ? `HTTP ${proxyHead.status}` : "unreachable"
    )
  ) {
    passed++;
  }

  const webhookHead = await fetch(`${baseUrl}/api/webhooks/clerk`, { method: "POST", body: "{}" }).catch(() => null);
  total++;
  if (
    await check(
      "Clerk webhook route",
      Boolean(webhookHead && webhookHead.status !== 404),
      webhookHead ? `HTTP ${webhookHead.status}` : "unreachable"
    )
  ) {
    passed++;
  }

  console.log("\nVercel env vars to confirm in Dashboard → Settings → Environment Variables (Production):");
  for (const name of [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  (pk_live_*)",
    "CLERK_SECRET_KEY                   (sk_live_*)",
    "CLERK_WEBHOOK_SECRET               (whsec_*)",
    "NEXT_PUBLIC_APP_URL                 https://scopebuddy.ai",
    "NEXT_PUBLIC_CLERK_PROXY_URL         /__clerk",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL       /sign-in",
    "NEXT_PUBLIC_CLERK_SIGN_UP_URL       /sign-up",
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL /projects",
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL /projects",
  ]) {
    console.log(`  • ${name}`);
  }

  console.log("\nClerk Dashboard checklist:");
  console.log("  • Domains → primary: scopebuddy.ai");
  console.log("  • Domains → proxy URL: https://scopebuddy.ai/__clerk");
  console.log("  • Webhooks → endpoint: https://scopebuddy.ai/api/webhooks/clerk");
  console.log("  • Webhook signing secret matches CLERK_WEBHOOK_SECRET in Vercel");

  console.log(`\n${passed}/${total} live checks passed.`);
  if (passed !== total) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
