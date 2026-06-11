#!/usr/bin/env node

import { Resend } from "resend";

function readEnv(name) {
  const value = process.env[name]?.trim();
  return value || null;
}

function resolveEmailFrom() {
  const configured = readEnv("EMAIL_FROM");
  if (configured) return configured;

  const appUrl = readEnv("NEXT_PUBLIC_APP_URL");
  if (appUrl) {
    try {
      const hostname = new URL(appUrl).hostname.replace(/^www\./, "");
      if (hostname === "scopebuddy.ai") {
        return "ScopeBuddy <hello@scopebuddy.ai>";
      }
    } catch {
      // Ignore invalid app URL values.
    }
  }

  return "onboarding@resend.dev";
}

function domainFromAddress(from) {
  const match = from.match(/@([\w.-]+)/);
  return match?.[1]?.toLowerCase() ?? null;
}

async function main() {
  const apiKey = readEnv("RESEND_API_KEY");
  const emailFrom = resolveEmailFrom();
  const fromDomain = domainFromAddress(emailFrom);

  if (!apiKey) {
    console.error("Missing RESEND_API_KEY.");
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.domains.list();

  if (error) {
    console.error("Could not list Resend domains:", error.message);
    process.exit(1);
  }

  const domains =
    data?.data?.map((entry) => ({
      name: entry.name,
      status: entry.status,
    })) ?? [];

  console.log("EMAIL_FROM:", emailFrom);
  console.log("Verified Resend domains:", domains);

  if (!fromDomain) {
    console.warn("Could not parse a domain from EMAIL_FROM.");
    process.exit(0);
  }

  const match = domains.find((entry) => entry.name === fromDomain);
  if (!match) {
    console.error(
      `EMAIL_FROM uses ${fromDomain}, but that domain is not in this Resend account.`
    );
    process.exit(1);
  }

  if (match.status !== "verified") {
    console.error(`Resend domain ${fromDomain} exists but status is ${match.status}.`);
    process.exit(1);
  }

  console.log(`OK: ${fromDomain} is verified for production email.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
