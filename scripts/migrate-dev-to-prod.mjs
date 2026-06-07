#!/usr/bin/env node
/**
 * Migrate ScopeMate users from Clerk development to Clerk production.
 *
 * Default mode (same Supabase): creates production Clerk users, then remaps
 * Clerk user IDs in the existing database so projects and related data stay intact.
 *
 * Cross-database mode: set PROD_DATABASE_URL (and prod Supabase storage vars) to
 * copy rows into a separate production database.
 *
 * Usage:
 *   node scripts/migrate-dev-to-prod.mjs --dry-run
 *   node scripts/migrate-dev-to-prod.mjs --yes
 *
 * Env (source): .env.local — DEV Clerk + Supabase
 * Env (target): .env.migration.local — PROD_CLERK_SECRET_KEY (required),
 *               optional PROD_DATABASE_URL / PROD_SUPABASE_* for cross-db copy
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const USER_ID_COLUMNS = [
  { table: "projects", column: "homeowner_id" },
  { table: "contractor_invitations", column: "invited_by" },
  { table: "contractor_invitations", column: "contractor_user_id" },
  { table: "scope_suggestions", column: "resolved_by" },
  { table: "contractor_rate_items", column: "contractor_user_id" },
];

const TABLES_BY_PROJECT = [
  "scope_items",
  "ai_runs",
  "follow_up_questions",
  "project_photos",
  "project_cost_expectations",
  "project_share_views",
  "contractor_invitations",
  "contractor_reviews",
  "scope_suggestions",
  "suggestion_follow_ups",
  "contractor_estimates",
  "estimate_line_items",
];

function loadEnvFile(filename) {
  const path = join(ROOT, filename);
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const mappingFlag = argv.find((arg) => arg.startsWith("--mapping-file="));
  return {
    dryRun: argv.includes("--dry-run"),
    yes: argv.includes("--yes"),
    skipStorage: argv.includes("--skip-storage"),
    remapOnly: argv.includes("--remap-only"),
    mappingFile: mappingFlag ? mappingFlag.slice("--mapping-file=".length) : null,
    emails: (() => {
      const flag = argv.find((arg) => arg.startsWith("--emails="));
      return flag ? flag.slice("--emails=".length).split(",").map((e) => e.trim()) : null;
    })(),
  };
}

function mask(value) {
  if (!value) return "(missing)";
  if (value.length <= 12) return "***";
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

async function clerkFetch(secretKey, path, options = {}) {
  const response = await fetch(`https://api.clerk.com/v1${path}`, {
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
    // keep raw text
  }

  if (!response.ok) {
    const detail =
      typeof body === "object" && body
        ? JSON.stringify(body.errors ?? body)
        : String(body);
    throw new Error(`Clerk API ${path} failed (${response.status}): ${detail}`);
  }

  return body;
}

async function listClerkUsers(secretKey) {
  const users = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const page = await clerkFetch(secretKey, `/users?limit=${limit}&offset=${offset}`);
    const batch = Array.isArray(page) ? page : page.data ?? [];
    users.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }

  return users;
}

function resolveClerkEmail(user) {
  return (
    user.email_addresses?.find((entry) => entry.id === user.primary_email_address_id)
      ?.email_address ?? user.email_addresses?.[0]?.email_address
  );
}

async function findProdClerkUserByEmail(prodSecret, email) {
  const result = await clerkFetch(
    prodSecret,
    `/users?email_address=${encodeURIComponent(email)}&limit=1`
  );
  const users = Array.isArray(result) ? result : result.data ?? [];
  return users[0] ?? null;
}

async function ensureProdClerkUser(prodSecret, devUser, dryRun) {
  const email = resolveClerkEmail(devUser);
  if (!email) {
    throw new Error(`Dev user ${devUser.id} has no email address.`);
  }

  const existing = await findProdClerkUserByEmail(prodSecret, email);
  if (existing) {
    return { email, devId: devUser.id, prodId: existing.id, created: false };
  }

  if (dryRun) {
    return { email, devId: devUser.id, prodId: `(new-for-${email})`, created: true };
  }

  const created = await clerkFetch(prodSecret, "/users", {
    method: "POST",
    body: JSON.stringify({
      email_address: [email],
      first_name: devUser.first_name ?? undefined,
      last_name: devUser.last_name ?? undefined,
      skip_password_requirement: true,
      external_id: devUser.id,
    }),
  });

  return { email, devId: devUser.id, prodId: created.id, created: true };
}

async function fetchDevUsers(client, devClerkUsers, emailFilter) {
  const emails = new Set(
    devClerkUsers
      .map((user) => resolveClerkEmail(user))
      .filter(Boolean)
      .filter((email) => (emailFilter ? emailFilter.includes(email) : true))
  );

  const { rows } = await client.query(
    `SELECT id, email, name, role, created_at
     FROM users
     WHERE email = ANY($1::text[])
     ORDER BY created_at`,
    [Array.from(emails)]
  );

  const byEmail = new Map(rows.map((row) => [row.email, row]));
  const selected = [];

  for (const clerkUser of devClerkUsers) {
    const email = resolveClerkEmail(clerkUser);
    if (!email || (emailFilter && !emailFilter.includes(email))) continue;

    const dbUser = byEmail.get(email);
    if (!dbUser) {
      console.warn(`  Skipping ${email}: exists in Clerk dev but not in database.`);
      continue;
    }

    if (dbUser.id !== clerkUser.id) {
      console.warn(
        `  Warning: ${email} DB id (${dbUser.id}) differs from Clerk dev id (${clerkUser.id}). Using Clerk id.`
      );
    }

    selected.push({
      email,
      devId: clerkUser.id,
      name: dbUser.name,
      role: dbUser.role,
      createdAt: dbUser.created_at,
    });
  }

  return selected;
}

async function tableExists(client, table) {
  const { rows } = await client.query(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  return rows.length > 0;
}

async function countReferences(client, userId) {
  const counts = {};
  for (const { table, column } of USER_ID_COLUMNS) {
    if (!(await tableExists(client, table))) continue;
    const { rows } = await client.query(
      `SELECT COUNT(*)::int AS count FROM ${table} WHERE ${column} = $1`,
      [userId]
    );
    counts[`${table}.${column}`] = rows[0].count;
  }

  if (await tableExists(client, "contractor_profiles")) {
    const profile = await client.query(
      `SELECT COUNT(*)::int AS count FROM contractor_profiles WHERE user_id = $1`,
      [userId]
    );
    counts["contractor_profiles.user_id"] = profile.rows[0].count;
  }

  const projects = await client.query(
    `SELECT COUNT(*)::int AS count FROM projects WHERE homeowner_id = $1`,
    [userId]
  );
  counts["projects.homeowner_id"] = projects.rows[0].count;

  return counts;
}

async function remapUserIds(client, mappings, dryRun) {
  for (const mapping of mappings) {
    const { devId, prodId, email } = mapping;
    if (devId === prodId) {
      console.log(`  ${email}: already using production Clerk id, skipping remap.`);
      continue;
    }

    const counts = await countReferences(client, devId);
    console.log(`  ${email}: ${devId} → ${prodId}`);
    for (const [key, count] of Object.entries(counts)) {
      if (count > 0) console.log(`    ${key}: ${count}`);
    }

    if (dryRun) continue;

    await client.query("BEGIN");
    try {
      const { rows: existingProdUsers } = await client.query(
        `SELECT id FROM users WHERE id = $1`,
        [prodId]
      );

      if (existingProdUsers.length === 0) {
        const { rows: devUsers } = await client.query(
          `SELECT email, name, role, created_at FROM users WHERE id = $1`,
          [devId]
        );
        if (devUsers.length === 0) {
          throw new Error(`Dev user ${devId} (${email}) not found in database.`);
        }

        const devUser = devUsers[0];
        await client.query(`UPDATE users SET email = $1 WHERE id = $2`, [
          `migrate-temp-${devId}@scopemate.internal`,
          devId,
        ]);
        await client.query(
          `INSERT INTO users (id, email, name, role, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [prodId, devUser.email, devUser.name, devUser.role, devUser.created_at]
        );
      }

      for (const { table, column } of USER_ID_COLUMNS) {
        if (!(await tableExists(client, table))) continue;
        await client.query(
          `UPDATE ${table} SET ${column} = $1 WHERE ${column} = $2`,
          [prodId, devId]
        );
      }

      if (await tableExists(client, "contractor_profiles")) {
        const profile = await client.query(
          `SELECT 1 FROM contractor_profiles WHERE user_id = $1`,
          [devId]
        );
        if (profile.rowCount > 0) {
          await client.query(`DELETE FROM contractor_profiles WHERE user_id = $1`, [prodId]);
          await client.query(
            `UPDATE contractor_profiles SET user_id = $1 WHERE user_id = $2`,
            [prodId, devId]
          );
        }
      }

      await client.query(`DELETE FROM users WHERE id = $1`, [devId]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
}

async function fetchProjectIds(client, homeownerIds) {
  const { rows } = await client.query(
    `SELECT id FROM projects WHERE homeowner_id = ANY($1::text[])`,
    [homeownerIds]
  );
  return rows.map((row) => row.id);
}

async function copyProjectGraph(sourceClient, targetClient, projectIds, idMap, dryRun) {
  if (projectIds.length === 0) return;

  const remap = (row, columns) => {
    const copy = { ...row };
    for (const column of columns) {
      if (copy[column] && idMap.has(copy[column])) {
        copy[column] = idMap.get(copy[column]);
      }
    }
    return copy;
  };

  const insertRows = async (table, rows, columns = []) => {
    if (rows.length === 0) return;
    console.log(`    ${table}: ${rows.length} row(s)`);
    if (dryRun) return;

    const remapped = rows.map((row) => remap(row, columns));
    const keys = Object.keys(remapped[0]);
    const values = [];
    const placeholders = remapped
      .map((row, rowIndex) => {
        const base = rowIndex * keys.length;
        keys.forEach((key) => values.push(row[key]));
        return `(${keys.map((_, colIndex) => `$${base + colIndex + 1}`).join(", ")})`;
      })
      .join(", ");

    await targetClient.query(
      `INSERT INTO ${table} (${keys.join(", ")})
       VALUES ${placeholders}
       ON CONFLICT DO NOTHING`,
      values
    );
  };

  const homeowners = Array.from(idMap.keys());
  const { rows: users } = await sourceClient.query(
    `SELECT * FROM users WHERE id = ANY($1::text[])`,
    [homeowners]
  );
  await insertRows(
    "users",
    users.map((row) => remap(row, ["id"])),
    ["id"]
  );

  const { rows: projects } = await sourceClient.query(
    `SELECT * FROM projects WHERE id = ANY($1::uuid[])`,
    [projectIds]
  );
  await insertRows("projects", projects.map((row) => remap(row, ["homeowner_id"])), [
    "homeowner_id",
  ]);

  for (const table of TABLES_BY_PROJECT) {
    if (
      [
        "contractor_invitations",
        "contractor_reviews",
        "scope_suggestions",
        "suggestion_follow_ups",
        "contractor_estimates",
        "estimate_line_items",
      ].includes(table)
    ) {
      continue;
    }

    const { rows } = await sourceClient.query(
      `SELECT * FROM ${table} WHERE project_id = ANY($1::uuid[])`,
      [projectIds]
    );
    await insertRows(table, rows);
  }

  const { rows: invitations } = await sourceClient.query(
    `SELECT * FROM contractor_invitations WHERE project_id = ANY($1::uuid[])`,
    [projectIds]
  );
  await insertRows(
    "contractor_invitations",
    invitations.map((row) => remap(row, ["invited_by", "contractor_user_id"])),
    ["invited_by", "contractor_user_id"]
  );

  const invitationIds = invitations.map((row) => row.id);
  if (invitationIds.length > 0) {
    const { rows: reviews } = await sourceClient.query(
      `SELECT * FROM contractor_reviews WHERE invitation_id = ANY($1::uuid[])`,
      [invitationIds]
    );
    await insertRows("contractor_reviews", reviews);

    const { rows: suggestions } = await sourceClient.query(
      `SELECT * FROM scope_suggestions WHERE invitation_id = ANY($1::uuid[])`,
      [invitationIds]
    );
    await insertRows(
      "scope_suggestions",
      suggestions.map((row) => remap(row, ["resolved_by"])),
      ["resolved_by"]
    );

    const suggestionIds = suggestions.map((row) => row.id);
    if (suggestionIds.length > 0) {
      const { rows: followUps } = await sourceClient.query(
        `SELECT * FROM suggestion_follow_ups WHERE suggestion_id = ANY($1::uuid[])`,
        [suggestionIds]
      );
      await insertRows("suggestion_follow_ups", followUps);
    }

    const { rows: estimates } = await sourceClient.query(
      `SELECT * FROM contractor_estimates WHERE invitation_id = ANY($1::uuid[])`,
      [invitationIds]
    );
    await insertRows("contractor_estimates", estimates);

    const estimateIds = estimates.map((row) => row.id);
    if (estimateIds.length > 0) {
      const { rows: lineItems } = await sourceClient.query(
        `SELECT * FROM estimate_line_items WHERE estimate_id = ANY($1::uuid[])`,
        [estimateIds]
      );
      await insertRows("estimate_line_items", lineItems);
    }
  }

  const { rows: profiles } = await sourceClient.query(
    `SELECT * FROM contractor_profiles WHERE user_id = ANY($1::text[])`,
    [homeowners]
  );
  await insertRows(
    "contractor_profiles",
    profiles.map((row) => remap(row, ["user_id"])),
    ["user_id"]
  );

  const { rows: rates } = await sourceClient.query(
    `SELECT * FROM contractor_rate_items WHERE contractor_user_id = ANY($1::text[])`,
    [homeowners]
  );
  await insertRows(
    "contractor_rate_items",
    rates.map((row) => remap(row, ["contractor_user_id"])),
    ["contractor_user_id"]
  );
}

async function copyStorageObjects({
  sourceSupabase,
  targetSupabase,
  bucket,
  paths,
  dryRun,
}) {
  if (paths.length === 0) return;

  console.log(`  Copying ${paths.length} photo object(s) to production storage...`);
  for (const storagePath of paths) {
    if (dryRun) {
      console.log(`    [dry-run] ${storagePath}`);
      continue;
    }

    const { data, error } = await sourceSupabase.storage.from(bucket).download(storagePath);
    if (error) throw new Error(`Download failed for ${storagePath}: ${error.message}`);

    const { error: uploadError } = await targetSupabase.storage
      .from(bucket)
      .upload(storagePath, data, { upsert: true, contentType: data.type || undefined });

    if (uploadError) {
      throw new Error(`Upload failed for ${storagePath}: ${uploadError.message}`);
    }
  }
}

function loadMappingFile(path) {
  const absolute = path.startsWith("/") ? path : join(ROOT, path);
  const raw = readFileSync(absolute, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Mapping file must be a JSON array.");
  }
  return parsed.map((entry) => {
    if (!entry.email || !entry.devId || !entry.prodId) {
      throw new Error("Each mapping entry needs email, devId, and prodId.");
    }
    return entry;
  });
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env.migration.local");

  const devClerkSecret = process.env.CLERK_SECRET_KEY;
  const prodClerkSecret = process.env.PROD_CLERK_SECRET_KEY?.trim();
  const sourceDatabaseUrl = process.env.DATABASE_URL;
  const targetDatabaseUrl = process.env.PROD_DATABASE_URL || sourceDatabaseUrl;
  const sameDatabase = targetDatabaseUrl === sourceDatabaseUrl;

  const sourceSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sourceServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const targetSupabaseUrl = process.env.PROD_SUPABASE_URL || sourceSupabaseUrl;
  const targetServiceRole = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || sourceServiceRole;
  const bucket = process.env.SUPABASE_PROJECT_PHOTOS_BUCKET ?? "project-photos";

  if (!devClerkSecret?.startsWith("sk_test_")) {
    throw new Error("Missing development CLERK_SECRET_KEY (sk_test_) in .env.local.");
  }
  const args = parseArgs(process.argv.slice(2));
  if (!args.remapOnly && !args.mappingFile && !prodClerkSecret?.startsWith("sk_live_")) {
    throw new Error(
      "Missing PROD_CLERK_SECRET_KEY (sk_live_) in .env.migration.local."
    );
  }
  if (!sourceDatabaseUrl) {
    throw new Error("Missing DATABASE_URL in .env.local.");
  }

  console.log("ScopeMate dev → prod migration");
  console.log(`  Mode: ${sameDatabase ? "same database (ID remap)" : "cross-database copy"}`);
  console.log(`  Dev Clerk: ${mask(devClerkSecret)}`);
  console.log(`  Prod Clerk: ${mask(prodClerkSecret)}`);
  console.log(`  Database: ${mask(targetDatabaseUrl)}`);
  console.log(`  Dry run: ${args.dryRun ? "yes" : "no"}`);
  console.log("");

  if (!args.yes && !args.dryRun) {
    console.error("Re-run with --yes to apply changes, or --dry-run to preview.");
    process.exit(1);
  }

  const sourceClient = new pg.Client({
    connectionString: sourceDatabaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  const targetClient = sameDatabase
    ? sourceClient
    : new pg.Client({
        connectionString: targetDatabaseUrl,
        ssl: { rejectUnauthorized: false },
      });

  const sourceSupabase = createClient(sourceSupabaseUrl, sourceServiceRole);
  const targetSupabase = sameDatabase
    ? sourceSupabase
    : createClient(targetSupabaseUrl, targetServiceRole);

  try {
    await sourceClient.connect();
    if (!sameDatabase) await targetClient.connect();

    console.log("Loading Clerk development users...");
    const devClerkUsers = await listClerkUsers(devClerkSecret);
    console.log(`  Found ${devClerkUsers.length} user(s) in Clerk development.`);

    const devUsers = await fetchDevUsers(sourceClient, devClerkUsers, args.emails);
    if (devUsers.length === 0) {
      throw new Error("No matching users to migrate.");
    }

    console.log(`Selected ${devUsers.length} user(s) for migration:`);
    for (const user of devUsers) {
      const counts = await countReferences(sourceClient, user.devId);
      const projectCount = counts["projects.homeowner_id"] ?? 0;
      console.log(`  • ${user.email} (${projectCount} project(s))`);
    }
    console.log("");

    let mappings = [];
    if (args.mappingFile) {
      console.log(`Using ID mapping file: ${args.mappingFile}`);
      mappings = loadMappingFile(args.mappingFile);
      for (const mapping of mappings) {
        console.log(`  ${mapping.email}: ${mapping.devId} → ${mapping.prodId}`);
      }
    } else if (args.remapOnly) {
      throw new Error("Use --mapping-file with --remap-only.");
    } else {
      console.log("Ensuring production Clerk users...");
      for (const devUser of devClerkUsers) {
        const email = resolveClerkEmail(devUser);
        if (!email) continue;
        if (args.emails && !args.emails.includes(email)) continue;
        if (!devUsers.some((user) => user.email === email)) continue;

        const mapping = await ensureProdClerkUser(prodClerkSecret, devUser, args.dryRun);
        mappings.push(mapping);
        console.log(
          `  ${mapping.created ? "Created" : "Found"} ${email} → ${mapping.prodId}`
        );
      }
    }
    console.log("");

    const idMap = new Map(mappings.map((mapping) => [mapping.devId, mapping.prodId]));
    const homeownerIds = mappings.map((mapping) => mapping.devId);
    const projectIds = await fetchProjectIds(sourceClient, homeownerIds);
    console.log(`Projects to preserve: ${projectIds.length}`);

    if (sameDatabase) {
      console.log("Remapping Clerk user IDs in database...");
      await remapUserIds(targetClient, mappings, args.dryRun);
    } else {
      console.log("Copying project data to production database...");
      await copyProjectGraph(sourceClient, targetClient, projectIds, idMap, args.dryRun);
    }

    if (!args.skipStorage && !sameDatabase) {
      const { rows: photos } = await sourceClient.query(
        `SELECT storage_path FROM project_photos WHERE project_id = ANY($1::uuid[])`,
        [projectIds]
      );
      await copyStorageObjects({
        sourceSupabase,
        targetSupabase,
        bucket,
        paths: photos.map((row) => row.storage_path),
        dryRun: args.dryRun,
      });
    }

    console.log("");
    if (args.dryRun) {
      console.log("Dry run complete. Re-run with --yes to apply.");
    } else {
      console.log("Migration complete.");
      console.log(
        "Next: users should sign in on production (https://myscopemate.ai) with the same email."
      );
    }
  } finally {
    await sourceClient.end().catch(() => {});
    if (!sameDatabase) await targetClient.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
