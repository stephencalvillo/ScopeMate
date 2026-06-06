# Phase 5 Plan

## Estimate Builder

**Status:** Complete.

**Depends on:** Phase 4 complete.

---

## Why Phase 5 exists

Once scope is clear, contractors need to respond with **real numbers**. Phase 5 adds draft estimates and proposals — not ScopeMate-owned pricing.

> Contractor generates a draft → edits line items → submits proposal with a project total.

---

## Product principles

| Principle | What it means |
| --- | --- |
| Contractor-owned pricing | AI may suggest a draft; contractor edits every number |
| Line items + total | Each row has labor, materials, and a line total; estimate rolls up to one project total |
| Proposal, not binding quote | Copy states numbers must be verified on site |
| Tied to review | One estimate per contractor review (invitation token flow until Phase 6 accounts) |
| Homeowner sees submitted only | Draft estimates stay on the contractor side until proposal is submitted |

---

## Shipped

| Item | Status |
| ---- | ------ |
| Migration `011` — `contractor_estimates`, `estimate_line_items` | Done |
| API — contractor GET/PUT/generate/submit on review token | Done |
| API — homeowner read submitted proposal | Done |
| AI draft generation from scope (`estimate-v1` prompt) | Done |
| Contractor inline estimate editor on review page | Done |
| Auto-prefill draft ranges by project location | Done |
| Homeowner submitted proposal on reviewed scope detail | Done |
| Proposal-aware review-complete email to homeowner | Done |
| Compare multiple contractor proposals (reviewed scopes tab) | Done |
| Homeowner accepts one proposal; others auto-declined | Done |
| Accepted / not selected badges + contractor outcome banners | Done |
| Floating accept dock + project **Accepted** badge | Done |
| Post-accept summary on project detail | Done |

---

## Phase 5.5 — Proposal acceptance

**Status:** Complete.

**Migration:** `012_proposal_acceptance.sql` — estimate `accepted`/`declined`, `projects.accepted_estimate_id`, invitation `closed_out`.

**Before prod:** Apply migration `012` in production.

---

## Test plan

- [ ] Contractor opens review → draft ranges prefill → edit ranges → submit review
- [ ] Submitted review shows proposal totals and per-item ranges on contractor page
- [ ] Homeowner reviewed scopes list shows proposal range on contractor card
- [ ] Homeowner review detail shows full proposal breakdown
- [ ] Homeowner email includes proposal range when contractor submitted pricing
- [ ] Compare proposals table appears when 2+ contractors submitted pricing
- [ ] Homeowner never sees draft estimates before contractor submits review

---

## Deferred / later

| Item | Notes |
| ---- | ----- |
| Apply migration `011` in prod | Run before enabling estimates in production |
| Apply migration `012` in prod | Run before enabling proposal acceptance in production |

---

## Data model

### `contractor_estimates`

| Column | Type | Notes |
| --- | --- | --- |
| `review_id` | UUID FK UNIQUE | One estimate per review |
| `invitation_id` | UUID FK | Matches Phase 3 token flow |
| `status` | TEXT | `draft`, `submitted` |
| `total` | NUMERIC | Sum of line items |

### `estimate_line_items`

| Column | Type | Notes |
| --- | --- | --- |
| `estimate_id` | UUID FK | |
| `scope_item_id` | UUID FK nullable | Optional link to scope row |
| `description` | TEXT | |
| `labor_cost` | NUMERIC | |
| `material_cost` | NUMERIC | |
| `total` | NUMERIC | labor + material |

---

## Out of scope (Phase 5)

- Contractor Clerk accounts (Phase 6)
- Saved rates / templates (Phase 6)
- Payments or e-sign
- Homeowner editing estimates
- Market pricing APIs

---

## Success criteria

- Contractor can generate a draft, edit line items, and submit a proposal with a total.
- Homeowner sees submitted proposal on the reviewed scope detail page.
- Draft totals are never shown to the homeowner.

---

## References

- `ROADMAP.md` — Phase 5 summary
- `prompts/estimate-v1.md` — AI draft prompt
- `lib/estimates/` — estimate services
