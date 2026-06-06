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

## Phase 3 - Contractor Collaboration *(next)*

**Plan:** See [`PHASE_3_PLAN.md`](./PHASE_3_PLAN.md) *(design confirmed 2026-06-05)*

**Build:**

- Email contractor invitations (30-day expiry) + copy link fallback
- Contractor review mode at `/review/[token]` with mark-review-complete gate
- Scope suggestions (add, edit, remove, note); editable until review submitted
- Homeowner inbox at **top of project page**: accept, reject, or ask follow-up

**Success:** A contractor can review a project and submit scope suggestions in under 5 minutes; the homeowner accepts or rejects each suggestion before it becomes part of the scope.

**Still out of scope:** Contractor accounts (Clerk), estimates, pricing, cost tiers.

---

## Phase 4 - Cost Expectations

Add planning ranges.

**Tiers:**

| Tier | Description |
|---|---|
| Essential | Functional materials |
| Elevated | Better finishes |
| Signature | Premium finishes |

Never show exact pricing.

---

## Phase 5 - Estimate Builder

Contractor can:

- Generate draft estimate
- Edit line items
- Submit proposal

AI assists but never owns final pricing.

---

## Phase 6 - Contractor Pro

**Features:**

- Saved rates
- Saved templates
- Proposal templates
- Bid history

Subscription product.

---

## Phase 7 - Marketplace

- Homeowners request bids
- Contractors receive qualified leads
- Optional future business model
