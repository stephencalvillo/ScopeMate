# ScopeMate  -  Project Brief

## Vision

ScopeMate helps homeowners clearly define construction projects and helps contractors respond with better bids.

The platform uses AI to transform homeowner descriptions into contractor-ready scopes, allows contractors to improve those scopes, and eventually supports bid creation and comparison.

## Core Problem

Homeowners struggle to describe renovation and construction projects.

Contractors waste time:

- Clarifying scope
- Identifying missing details
- Chasing information
- Creating bids from incomplete requirements

## Solution

Create a shared project definition before pricing begins.

```
Homeowner describes project ? AI creates scope ? contractor reviews scope ? homeowner approves scope ? contractor submits bid
```

## Primary Users

### Homeowners

- Create projects
- Upload photos *(Phase 2)*
- Edit scopes
- Share with contractors
- Compare bids *(Phase 5+)*

### Contractors

- Review project scopes *(Phase 3)*
- Suggest missing items *(Phase 3)*
- Create estimates *(Phase 5)*
- Submit proposals *(Phase 5)*

## MVP Success Criteria

- A homeowner can create a contractor-ready scope in under 10 minutes.
- A contractor can review that scope and provide feedback in under 5 minutes. *(Phase 3)*

## Non-Goals

Do not build:

- Payments
- Scheduling
- Project management
- Permit filing
- Change order workflows
- Exact pricing engine

**Focus on scope clarity first.**

## Phase 1 Scope (Current Build Target)

Phase 1 delivers the **Homeowner MVP**:

| Capability | Description |
|---|---|
| Authentication | Homeowner accounts via Clerk (magic link + Google) |
| Project creation | Title, project type, location, free-text description |
| AI scope generation | Server-side OpenAI call producing structured scope items |
| Scope editing | Homeowner can add, edit, remove, and reorder scope items |
| Share links | Secure token-based read-only link for contractors |

**Phase 1 success:** A homeowner can create and share a project with a contractor-ready scope.

**Phase 1 does not include:** photo uploads, quote-improvement checklist, follow-up questions, numerical scores, or contractor accounts.

---

## Phase 2 Preview — Information That Would Improve Quotes

After scope generation (Phase 2), homeowners see an optional checklist section titled **"Information That Would Improve Quotes"** — not a completeness score or percentage.

Optional items may include:

- Photos of the project area
- Approximate dimensions, if known (Small / Medium / Large / Not sure)
- Material preferences
- Desired timeline
- Permit status, if known
- Whether plumbing, electrical, or structural work is involved

**Rules:** Nothing blocks sharing. "Not sure" is always valid. No scoring. Items are framed as optional ways to help contractors quote more accurately.
