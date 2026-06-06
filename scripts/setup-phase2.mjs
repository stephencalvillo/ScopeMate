#!/usr/bin/env node
/**
 * Phase 2/3 Supabase setup: create project-photos bucket + run migrations 002-006.
 * Bucket: uses SUPABASE_SERVICE_ROLE_KEY
 * SQL: requires DATABASE_URL in .env.local (Supabase → Settings → Database → URI)
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = join(__dirname, "..", ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function runMigrations(client) {
  const migrations = [
    "002_location_field.sql",
    "003_phase2_quote_improvement_photos.sql",
    "004_remove_completeness_score.sql",
    "005_follow_up_scope_link.sql",
    "006_phase3_contractor_collaboration.sql",
  ];

  for (const file of migrations) {
    const sql = readFileSync(
      join(__dirname, "..", "supabase", "migrations", file),
      "utf8"
    );
    console.log(`Running ${file}...`);
    await client.query(sql);
    console.log("  OK");
  }
}

async function ensureStorageBucket(supabase, bucketName) {
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) throw listError;

  if (buckets?.some((b) => b.name === bucketName)) {
    console.log(`Storage bucket "${bucketName}" already exists.`);
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(
    bucketName,
    {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    }
  );

  if (createError) throw createError;
  console.log(`Created storage bucket "${bucketName}".`);
}

async function main() {
  loadEnvLocal();

  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucketName =
    process.env.SUPABASE_PROJECT_PHOTOS_BUCKET ?? "project-photos";

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await ensureStorageBucket(supabase, bucketName);

  if (databaseUrl) {
    const client = new pg.Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      console.log("Connected to Postgres.");
      await runMigrations(client);
    } finally {
      await client.end();
    }
  } else {
    console.log("");
    console.log("DATABASE_URL is not in .env.local — SQL migrations were skipped.");
    console.log(
      "Add it from Supabase → Settings → Database → Connection string (URI),"
    );
    console.log("then run: node scripts/setup-phase2.mjs");
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error("Setup failed:", error.message ?? error);
  process.exit(1);
});
