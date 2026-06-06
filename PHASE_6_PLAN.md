# Phase 6 Plan

## Contractor Pro

**Status:** Planning.

**Depends on:** Phase 5.5 complete (estimates, proposals, acceptance).

---

## Why Phase 6 exists

Phases 3–5 let contractors collaborate **without an account** — open a token link, review scope, submit a proposal, optionally create a Clerk account at the end. That works for one-off jobs but not for repeat use.

Phase 6 turns ScopeMate into a **contractor workspace**:

> Sign in once → see all your reviews and bids → reuse your rates and templates → respond faster on the next invite.

This is also the first **paid** product tier (Contractor Pro subscription).

---

## Product principles

| Principle | What it means |
| --- | --- |
| Token flow stays | Unauthenticated contractors can still review via `/review/[token]` (Level 1) |
| Account adds persistence | Level 2 = saved work, history, templates — not a signup wall before first review |
| Contractor-owned pricing | Saved rates and templates are starting points; contractor edits every job |
| Homeowner UX unchanged | Homeowners still invite by email/link; they do not manage contractor subscriptions |
| Pro earns its price | Subscription unlocks speed tools (rates, templates, history), not core review access |
| Link on signup | Creating an account links past invitations matched by email |

---

## Current state (starting point)

| Area | Status |
| --- | --- |
| `/contractors` marketing + `/contractors/signup` | Shipped |
| `ContractorAccountCreateForm` + post-review signup dialog | Shipped |
| Clerk auth + `users` table with `role` | Shipped — **always defaults to `homeowner`** |
| Contractor dashboard | Not built — signup redirects to `/projects` |
| Invitation ↔ user link | Not built — `contractor_invitations` has no `user_id` |
| Saved rates / templates | Not built |
| Bid history UI | Not built — data exists in `contractor_estimates` |
| Stripe / subscription | Not built |

### Gaps to fix in 6A

1. **Role / profile** — Contractor signup must create a `contractor_profile` (and set `users.role = 'contractor'` or equivalent), not land on the homeowner dashboard.
2. **Webhook safety** — Clerk `user.updated` must not reset contractor role back to `homeowner`.
3. **Invitation linking** — On account create, attach open + historical invitations where `contractor_email` matches account email.

---

## Design decisions (proposed — confirm before build)

| # | Decision | Proposal | Rationale |
| --- | --- | --- | --- |
| 1 | Identity model | `contractor_profiles` table keyed by `users.id` | Keeps homeowner and contractor data separate; allows future dual-role without breaking Phase 1–5 |
| 2 | Access levels | Level 0 share · Level 1 token review · Level 2 signed-in contractor | Matches `ARCHITECTURE.md` |
| 3 | Dashboard route | `/contractor` (authenticated, contractor-only) | Distinct from homeowner `/projects` |
| 4 | Email match linking | Auto-link invitations on signup; no manual claim flow in MVP | Reduces friction after post-review signup |
| 5 | Saved rates scope | Per-category defaults (labor + material range), not per scope-item | Reusable across projects; AI draft + manual apply |
| 6 | Templates | Save submitted or draft estimate as named template; apply to new review draft | Speed on repeat project types (e.g. bathroom refresh) |
| 7 | Bid history | List all estimates for linked invitations; read-only after submit | Data already in `contractor_estimates` |
| 8 | Subscription gate | **Pro** unlocks saved rates, templates, and template apply | Free tier = account + bid history + token review |
| 9 | Billing | Stripe Checkout + Customer Portal; webhook syncs status to DB | Standard Vercel-friendly pattern |
| 10 | Pricing (TBD) | Single `contractor_pro` plan; monthly; price set at launch | Can start with flat test price in staging |

---

## Delivery phases

Phase 6 is large. Ship in slices so each PR is reviewable and deployable.

### 6A — Contractor accounts & dashboard *(foundation)*

**Goal:** A contractor can sign up, land in the right place, and see their linked reviews.

| Item | Notes |
| --- | --- |
| Migration `013` — `contractor_profiles`, `contractor_invitations.contractor_user_id` | Profile fields: company, display name, phone optional |
| Contractor signup completion API | Create profile, set role, link invitations by email |
| Fix Clerk webhook + `ensureUserRecord` | Preserve contractor role; don't overwrite on update |
| `/contractor` layout + shell | Sidebar or tabs: Reviews, Rates, Templates, Billing, Settings |
| Reviews list | Active + submitted invitations linked to user; open review token or read-only submitted view |
| Post-review dialog redirect | Signed-in contractors → `/contractor` not `/projects` |
| Onboarding empty state | First visit: confirm company name from invite prefill |

**Success:** Contractor signs up after submitting a review → sees that project on `/contractor`.

---

### 6B — Bid history

**Goal:** Contractors see past proposals in one place.

| Item | Notes |
| --- | --- |
| Bid history tab on `/contractor` | Filter: all / submitted / accepted / declined / closed |
| Row: project title, homeowner city, range, status, dates | Link to read-only proposal view |
| Read-only proposal detail | Reuse submitted estimate components; no edit after submit |
| Outcome badges | Reuse accepted / not selected / closed patterns from Phase 5.5 |

**Success:** Contractor with 3 past bids sees all three with correct status.

---

### 6C — Saved rates

**Goal:** Contractors maintain default pricing by trade/category.

| Item | Notes |
| --- | --- |
| Migration `014` — `contractor_rate_items` | category, description, labor_low/high or single values, sort_order |
| Rates CRUD UI | Settings or dedicated tab; add/edit/delete/reorder |
| Apply rates action on estimate editor | "Apply my rates" fills draft line items by category match |
| Optional: AI draft uses saved rates as hints | Pass rates into estimate prompt context (Pro-gated) |

**Success:** Contractor saves plumbing defaults → new review draft prefills matching categories.

---

### 6D — Proposal templates

**Goal:** Reuse a past estimate structure on a new job.

| Item | Notes |
| --- | --- |
| Migration `015` — `contractor_proposal_templates`, `contractor_proposal_template_items` | Snapshot of line items + pricing mode |
| Save as template | From draft or submitted estimate; name + optional description |
| Template library UI | List, duplicate, delete |
| Apply template | Merges into current review draft (scope-item match by category/description; manual rows for unmatched) |

**Success:** Contractor applies "Standard bath remodel" template → draft populated in under a minute.

---

### 6E — Subscription (Contractor Pro)

**Goal:** Monetize rates + templates; Stripe is source of truth.

| Item | Notes |
| --- | --- |
| Migration `016` — subscription fields on `contractor_profiles` or `contractor_subscriptions` | `stripe_customer_id`, `subscription_status`, `current_period_end` |
| Stripe Checkout for upgrade | `/contractor/billing` |
| Customer Portal link | Manage payment method / cancel |
| Webhook `checkout.session.completed`, `customer.subscription.*` | Sync status |
| Feature gates | Middleware or server checks: rates + templates require `active` subscription |
| Free tier UX | Show locked state with upgrade CTA, not hard errors |

**Success:** Contractor subscribes → saves rates and templates; cancel → read-only access to existing data, no new saves.

---

## User experience overview

### Contractor journey (new)

1. Homeowner sends invite → contractor completes review via token (unchanged).
2. Post-submit dialog → create account (existing) → **redirect to `/contractor`**.
3. Dashboard shows **This review** plus any older invites on same email.
4. Optional: subscribe to Pro → set up rates/templates for next job.

### Contractor journey (returning)

1. Sign in → `/contractor`.
2. Open active review from list (token URL or authenticated deep link).
3. Generate draft → apply rates and/or template → submit proposal.
4. Track outcome in bid history (accepted / not selected).

### Homeowner journey

**No change** in Phase 6 MVP. Homeowners do not see contractor subscription status.

---

## Data model (new tables)

### `contractor_profiles`

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | UUID PK FK → `users.id` | One profile per contractor account |
| `company_name` | TEXT | |
| `contact_name` | TEXT | Display name; may mirror `users.name` |
| `phone` | TEXT | Optional |
| `onboarding_completed_at` | TIMESTAMPTZ | |
| `stripe_customer_id` | TEXT | 6E |
| `subscription_status` | TEXT | `none`, `trialing`, `active`, `past_due`, `canceled` |
| `subscription_current_period_end` | TIMESTAMPTZ | 6E |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `contractor_invitations` (alter)

| Column | Type | Notes |
| --- | --- | --- |
| `contractor_user_id` | UUID FK → `users.id` NULL | Set when account links by email |

### `contractor_rate_items` *(6C)*

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `contractor_user_id` | UUID FK | |
| `category` | TEXT | Scope category slug |
| `label` | TEXT | e.g. "Plumbing — rough-in" |
| `labor_cost` | NUMERIC | Default labor (range low or single) |
| `material_cost` | NUMERIC | Default material (range high or single) |
| `sort_order` | INT | |

### `contractor_proposal_templates` *(6D)*

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `contractor_user_id` | UUID FK | |
| `name` | TEXT | |
| `description` | TEXT | Optional |
| `pricing_mode` | TEXT | `item` \| `section` |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `contractor_proposal_template_items` *(6D)*

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `template_id` | UUID FK | |
| `category` | TEXT | |
| `description` | TEXT | |
| `labor_cost` | NUMERIC | |
| `material_cost` | NUMERIC | |
| `sort_order` | INT | |

---

## API surface (planned)

| Route | Phase | Purpose |
| --- | --- | --- |
| `POST /api/contractor/profile` | 6A | Create/update profile, link invitations |
| `GET /api/contractor/reviews` | 6A | List linked invitations + review status |
| `GET /api/contractor/bids` | 6B | Bid history with estimate summary |
| `GET/POST/PATCH/DELETE /api/contractor/rates` | 6C | Saved rates CRUD |
| `POST /api/contractor/rates/apply` | 6C | Apply rates to current review estimate |
| `GET/POST/PATCH/DELETE /api/contractor/templates` | 6D | Template CRUD |
| `POST /api/contractor/templates/[id]/apply` | 6D | Apply template to review estimate |
| `POST /api/contractor/billing/checkout` | 6E | Stripe Checkout session |
| `POST /api/contractor/billing/portal` | 6E | Stripe Customer Portal |
| `POST /api/webhooks/stripe` | 6E | Subscription sync |

Authenticated contractor routes use Clerk session + `contractor_profiles` ownership checks. Review estimate mutations continue to accept token auth for Level 1 until 6A adds authenticated review access.

---

## Out of scope (Phase 6)

- Homeowner subscription or payments
- Marketplace / lead gen (Phase 7)
- Contractor-to-contractor messaging
- E-sign or deposit collection
- Mobile app
- Multi-user contractor teams / sub-accounts
- Import/export rates from Excel
- Automatic matching of templates to scope items via AI (optional later; MVP uses category + manual merge)

---

## Success criteria (Phase 6 complete)

- Contractor can create an account and access `/contractor` without seeing homeowner project creation UI.
- Past reviews on the same email appear on the dashboard automatically.
- Contractor can browse bid history with correct accepted/declined/submitted states.
- Pro subscriber can save rates and templates and apply them to a new review draft.
- Free contractor can still complete token reviews and view bid history.
- Stripe subscription status gates Pro features reliably.

---

## Test plan

### 6A — Accounts
- [ ] Submit review as guest → create account → land on `/contractor` with project listed
- [ ] Sign up at `/contractors/signup` → profile created → empty dashboard state
- [ ] Second invite on same email auto-links to account
- [ ] Clerk webhook update does not reset contractor role to homeowner

### 6B — Bid history
- [ ] Submitted, accepted, and declined bids show correct badges and ranges
- [ ] Read-only detail matches homeowner-facing proposal view

### 6C — Rates
- [ ] CRUD rates; apply fills estimate draft by category
- [ ] Non-subscriber sees upgrade prompt (after 6E)

### 6D — Templates
- [ ] Save estimate as template; apply on new review creates expected line items
- [ ] Unmatched scope items remain editable manually

### 6E — Billing
- [ ] Checkout → active subscription → rates/templates unlocked
- [ ] Cancel → status `canceled` → save blocked, history still visible
- [ ] Stripe webhook idempotency (replay safe)

---

## Suggested first PR (6A scope)

1. Migration `013_contractor_profiles.sql`
2. `lib/contractor/profile.ts` — create profile, link invitations
3. `POST /api/contractor/profile` + `GET /api/contractor/reviews`
4. `/contractor` dashboard shell + reviews list
5. Fix signup redirect + webhook role preservation
6. Update `ReviewSubmittedDialog` for signed-in contractor path

---

## References

- `ROADMAP.md` — Phase 6 summary
- `ARCHITECTURE.md` — Contractor access levels (Level 0–2)
- `components/review/contractor-account-create-form.tsx` — existing signup UI
- `components/review/review-submitted-dialog.tsx` — post-review account prompt
- `lib/estimates/` — estimate draft/submit (extend for rates/templates)
- `PHASE_3_PLAN.md` — token review flow (unchanged for Level 1)
