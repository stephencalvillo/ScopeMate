#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const repoRoot = join(fileURLToPath(import.meta.url), "..", "..");
const catalogPath = join(repoRoot, "lib/admin/screen-catalog.ts");

const SCAN_RULES = [
  {
    label: "homeowner app",
    test: (filePath) =>
      filePath.startsWith("app/(dashboard)/") &&
      !filePath.startsWith("app/(dashboard)/design-system/"),
  },
  {
    label: "contractor app",
    test: (filePath) => filePath.startsWith("app/(contractor)/"),
  },
  {
    label: "review flow",
    test: (filePath) => filePath.startsWith("app/review/"),
  },
];

function walkPages(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      walkPages(fullPath, files);
      continue;
    }

    if (entry === "page.tsx") {
      files.push(relative(repoRoot, fullPath));
    }
  }

  return files;
}

function filePathToProductionPath(filePath) {
  const route = filePath
    .replace(/^app\//, "")
    .replace(/\/page\.tsx$/, "")
    .split("/")
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .join("/");

  return `/${route}`;
}

function readCatalogProductionPaths() {
  const source = readFileSync(catalogPath, "utf8");
  const matches = [...source.matchAll(/productionPath:\s*"([^"]+)"/g)];

  return matches.map((match) => match[1]);
}

function discoverScannableRoutes() {
  const appDir = join(repoRoot, "app");
  const pageFiles = walkPages(appDir);

  return pageFiles
    .filter((filePath) => SCAN_RULES.some((rule) => rule.test(filePath)))
    .map((filePath) => ({
      filePath,
      productionPath: filePathToProductionPath(filePath),
    }))
    .sort((left, right) => left.productionPath.localeCompare(right.productionPath));
}

function buildScaffoldEntry(route) {
  const audience = route.productionPath.startsWith("/contractor")
    ? "contractor"
    : route.productionPath.startsWith("/review/")
      ? "contractor"
      : "homeowner";

  const slug = route.productionPath
    .replace(/^\//, "")
    .replace(/\[|\]/g, "")
    .replace(/\//g, "-");

  const id = `${audience}-${slug}`;

  return `  {
    id: "${id}",
    audience: "${audience}",
    title: "TODO: ${route.productionPath}",
    description: "TODO: describe this screen.",
    productionPath: "${route.productionPath}",
    category: "TODO",
  },`;
}

function main() {
  const mode = process.argv.includes("--scaffold") ? "scaffold" : "check";
  const discovered = discoverScannableRoutes();
  const catalogPaths = new Set(readCatalogProductionPaths());

  const missing = discovered.filter(
    (route) => !catalogPaths.has(route.productionPath)
  );
  const stale = [...catalogPaths].filter(
    (productionPath) =>
      !discovered.some((route) => route.productionPath === productionPath)
  );

  if (mode === "scaffold") {
    if (missing.length === 0 && stale.length === 0) {
      console.log("Screen catalog is in sync with scannable app routes.");
      return;
    }

    if (missing.length > 0) {
      console.log("Add these entries to lib/admin/screen-catalog.ts:\n");
      for (const route of missing) {
        console.log(`// ${route.filePath}`);
        console.log(buildScaffoldEntry(route));
        console.log("");
      }
      console.log(
        "Then add a preview case in components/admin/preview/admin-preview-screen.tsx"
      );
      console.log(
        "and fixtures in lib/admin/fixtures/ if the page loads data from APIs."
      );
    }

    if (stale.length > 0) {
      console.log("\nCatalog entries with no matching app route:");
      for (const productionPath of stale) {
        console.log(`- ${productionPath}`);
      }
    }

    return;
  }

  if (missing.length === 0 && stale.length === 0) {
    console.log(
      `Screen catalog check passed (${discovered.length} scannable routes).`
    );
    return;
  }

  if (missing.length > 0) {
    console.error("Missing screen catalog entries:\n");
    for (const route of missing) {
      console.error(`- ${route.productionPath} (${route.filePath})`);
    }
    console.error(
      "\nRun `npm run screen-catalog:scaffold` to print starter catalog entries."
    );
  }

  if (stale.length > 0) {
    console.error("\nStale screen catalog entries (no matching app route):\n");
    for (const productionPath of stale) {
      console.error(`- ${productionPath}`);
    }
  }

  process.exit(1);
}

main();
