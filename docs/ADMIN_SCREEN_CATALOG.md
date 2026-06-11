# Admin screen catalog

Internal tool for previewing homeowner and contractor pages with mock data.

| Route | Purpose |
|---|---|
| `/adminpanel/screens` | Audience overview and screen counts |
| `/adminpanel/screens/homeowner` | Homeowner gallery + iframe preview |
| `/adminpanel/screens/contractor` | Contractor gallery + iframe preview |
| `/adminpanel/preview/[screenId]` | Embeddable preview (admin-only) |

Access requires admin configuration (`ADMIN_EMAILS` or `ADMIN_USER_IDS`).

## When to update the catalog

Add or update a catalog entry whenever you ship a **new user-facing page** in:

- `app/(dashboard)/` (homeowner app — excludes `design-system/`)
- `app/(contractor)/` (contractor portal and onboarding)
- `app/review/` (share-link review flow)

Do **not** catalog marketing pages, auth pages, admin routes, or the design-system browser.

One catalog entry = **one page**, not one tab. Tabs stay interactive inside the project-detail preview.

## Checklist for a new screen

1. **Register the screen** in `lib/admin/screen-catalog.ts`
   - Set `productionPath` to match the app route (e.g. `/projects/[id]`)
   - Pick `audience`: `homeowner` or `contractor`

2. **Verify sync**
   ```bash
   npm run check:screen-catalog
   ```
   CI runs this on every push/PR to `main`.

3. **Scaffold starter entry** (if the check fails)
   ```bash
   npm run screen-catalog:scaffold
   ```

4. **Add mock data** in `lib/admin/fixtures/` when the page loads from APIs

5. **Add a preview renderer** in `components/admin/preview/admin-preview-screen.tsx`

6. **Add preview API routes** under `app/api/admin/preview/` if client tabs or forms fetch data after load (see homeowner project detail for the pattern)

## Key files

| File | Role |
|---|---|
| `lib/admin/screen-catalog.ts` | Source of truth for screen list and counts |
| `lib/admin/fixtures/` | Mock project, contractor, and tab data |
| `components/admin/preview/admin-preview-screen.tsx` | Maps screen IDs to rendered UI |
| `scripts/check-screen-catalog.mjs` | Route ↔ catalog sync check |

## Preview conventions

- Preview routes use fixtures, not production URLs or real Supabase rows.
- Project detail tabs use `ProjectPreviewContext` (`detailPath` + `apiBasePath`) so tab navigation and tab APIs work inside the iframe.
- `/adminpanel/preview/*` allows same-origin iframe embedding only.
