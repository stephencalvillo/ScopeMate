# ScopeMate - Roadmap

## Phase 1 - Homeowner MVP *(complete)*

**Build:**

- Authentication
- Project creation
- AI scope generation
- Scope editing
- Share links

**Success:** Homeowner can create and share a project.

---

## Phase 2 - Optional Context + Photos *(complete)*

**Build:**

- Photo uploads with drag-and-drop
- Smart follow-up questions (one at a time; categories: dimensions, materials, timeline, permits, trade scope)
- Answers sync to scope items automatically
- Share page: scope, summary, photos (grid + lightbox), location
- Floating share dock on project detail

**Rules:**

- Never require measurements (Small / Medium / Large / Not sure).
- Never block sharing.
- No completeness percentage or quote-readiness score.
- Frame follow-ups and photos as optional ways to help contractors quote more accurately.

**Future:** AI photo analysis.

---

## Phase 3 - Contractor Collaboration *(complete)*

**Plan:** [`PHASE_3_PLAN.md`](./PHASE_3_PLAN.md) · **Checklist:** [`PHASE_3_PUNCH_LIST.md`](./PHASE_3_PUNCH_LIST.md)

**Build:**

- Email contractor invitations (30-day expiry) + copy link fallback
- Contractor review mode at `/review/[token]` with submit-review gate
- Scope suggestions (add, edit, remove, note); editable until review submitted
- Homeowner **Needs attention** tab: accept, reject, or ask follow-up
- Reviewed scopes tab with snapshots; activity tab; cross-review auto-resolve

**Success:** A contractor can review a project and submit scope suggestions in under 5 minutes; the homeowner accepts or rejects each suggestion before it becomes part of the scope.

**Still out of scope:** Contractor accounts (Clerk), estimates, exact pricing.

---

## Phase 4 - Finish-Level Planning *(complete)*

**Plan:** [`PHASE_4_PLAN.md`](./PHASE_4_PLAN.md)

Optional project-wide finish level via follow-up question — not quotes.

**Shipped:** Materials follow-up with Builder grade / Elevated / High-end; answer syncs to scope.

---

## Phase 5 - Estimate Builder *(complete)*

**Plan:** [`PHASE_5_PLAN.md`](./PHASE_5_PLAN.md)

Contractors generate draft estimates from scope, edit line items, and submit proposals with a project total.

**Shipped:** Inline estimate editor on contractor review, AI draft prefill by location, homeowner proposal view, proposal-aware review-complete email, compare proposals on reviewed scopes tab.

---

## Phase 5.5 - Proposal Acceptance *(complete)*

**Build:**

- Homeowner accepts one proposal per project; others auto-declined
- Accepted / not selected badges on reviewed scopes and compare table
- Contractor outcome banners (accepted vs project closed)
- Floating accept dock when inline panel scrolls out of view
- Project status badge shows **Accepted** after selection
- Post-accept summary on project detail with link to winning proposal

**Rules:**

- One accepted proposal per project
- Non-selected contractors notified and closed out
- Acceptance is final (no undo in MVP)

**Before prod:** Run migration `012_proposal_acceptance.sql`.

---

## Phase 6 - Contractor Pro

**Plan:** [`PHASE_6_PLAN.md`](./PHASE_6_PLAN.md)

**Status:** Planning.

**Build (phased):**

| Slice | Focus |
| --- | --- |
| **6A** | Contractor accounts, profile, dashboard, invitation linking |
| **6B** | Bid history |
| **6C** | Saved rates |
| **6D** | Proposal templates |
| **6E** | Stripe subscription (Contractor Pro) |

**Features:**

- Saved rates
- Saved templates
- Proposal templates
- Bid history

Subscription product.

**Starting point:** Marketing signup + post-review account form exist; dashboard, profile linking, and Pro features not built yet.

---

## Phase 7 - Marketplace

- Homeowners request bids
- Contractors receive qualified leads
- Optional future business model
