# Phase 6.5 Plan

## Scope Quality Pack

**Status:** Planned — starts after Phase 6B (bid history) or in parallel if capacity allows.

**Depends on:** Phases 2–5.5 complete (follow-ups, photos, contractor review, estimates). Phase 6A shipped.

**Precedes:** Phase 7 (marketplace / qualified leads).

---

## Why Phase 6.5 exists

User feedback and contractor interviews converge on the same tension: **homeowners share too little context for accurate remote bidding**, but **ScopeMate must not become a pricing engine or a form-heavy gate**.

Phase 6.5 improves **what contractors receive** without changing the core loop or blocking share/review. It completes deferred Phase 4 finish-tier UX and sets up Phase 7’s “qualified lead” positioning.

> Homeowner adds optional, trade-aware context → contractor sees a clearer consideration summary → responds with **their** pricing.

---

## Product principles (carry forward)

| Principle | What it means in 6.5 |
| --- | --- |
| Optional, never blocking | Every new field can be skipped; sharing and review always work |
| Ranges, not quotes | Planning bands are for homeowner orientation only |
| Contractor-owned pricing | AI / bands never tell contractors what to bid |
| Coach, don’t gatekeep | Prompt for the *highest-variance* missing detail per project |
| Lead quality, not bid accuracy | Success = contractor knows scope + timeline + visuals, not perfect numbers |

---

## What feedback this addresses

| Feedback | Slice |
| --- | --- |
| “Refinish cabinets” with no count; hardscape with no LF | **6.5A** Trade-aware quantity follow-ups |
| Inspiration vs existing photos | **6.5B** Photo types |
| “Builder grade” means nothing to homeowners | **6.5C** Visual finish tiers + planning bands |
| “Ready in 1–3 months” as lead signal | **6.5D** Readiness summary on contractor view |
| Don’t show contractors what to bid | Explicit non-goal; bands are homeowner-only |

**Already shipped (no 6.5 work):** contractor summary/review workspace, editable proposals (Phase 5), photo upload (Phase 2), finish level question (Phase 4).

**Deferred beyond 6.5:** multi-project priority list, benchmark library (top 50–100 archetypes), AI photo analysis.

---

## Delivery slices

Ship as four small PRs. Each is deployable independently.

### 6.5A — Trade-aware quantity follow-ups

**Goal:** When scope includes high-variance trades, ask one optional quantity question homeowners can actually answer.

**Problem today:** Follow-ups cap at 3, use one generic `dimension_estimate` (Small/Medium/Large), and the prompt forbids asking for numbers. “Refinish cabinets” and “hardscape patio” leave contractors guessing.

**Approach:**

1. After scope generation, **deterministically inject** 0–2 trade-quantity questions based on active scope categories (not AI-only).
2. New question type: `approximate_quantity` with bucket choices + optional free-form entry.
3. Keep “Not sure” on every question; never block share.

**Trade templates (MVP — start with 6):**

| Scope signal | Example question | Bucket choices | Optional exact |
| --- | --- | --- | --- |
| `carpentry` + cabinet/refinish keywords | About how many cabinet doors or faces? | Under 15 / 15–30 / 30+ / Not sure | Optional count input |
| `hardscape` | Rough linear feet of hardscape? | Under 50 LF / 50–150 LF / 150+ LF / Not sure | Optional LF input |
| `painting` (exterior/interior) | Rough size of area to paint? | One room / Several rooms / Whole home / Not sure | Reuse dimension_estimate |
| `flooring` | Rough square footage to floor? | Under 200 / 200–800 / 800+ sq ft / Not sure | Optional sq ft |
| `tile` | Rough tile area? | Under 100 / 100–400 / 400+ sq ft / Not sure | Optional sq ft |
| `fixtures` + bath/kitchen | How many fixtures or rooms? | 1 / 2–3 / 4+ / Not sure | — |

**Rules:**

- Max **5** follow-up questions per project (raise `MAX_FOLLOW_UP_QUESTIONS` from 3 → 5).
- Trade-quantity questions use category `dimensions` or new category `quantity` (prefer `quantity` to avoid dedupe collision with room-size question).
- At most **one** trade-quantity question per trade template match; pick highest-variance match first.
- Answers sync to scope via existing `syncFollowUpAnswerToScope` flow.
- Update `prompts/follow-up-v1.md`: AI questions fill remaining slots; AI must not duplicate trade-quantity topics.

**Files (expected):**

| Area | Files |
| --- | --- |
| Schema | `supabase/migrations/016_scope_quality_follow_ups.sql` |
| Trade detection | `lib/follow-up/trade-quantity.ts` |
| Injection | `lib/follow-up/inject-trade-questions.ts`, extend `lib/ai/generate-follow-up.ts` |
| UI | `components/follow-up/approximate-quantity-input.tsx`, extend `follow-up-question-card.tsx` |
| Types | `types/index.ts` — `approximate_quantity`, category `quantity` |
| Prompt | `prompts/follow-up-v1.md` |

**Effort:** ~3–4 days

**Success:** Project with “refinish kitchen cabinets” gets an optional cabinet-count question; answering adds a scope line contractors see on review.

---

### 6.5B — Photo types (Current vs Inspiration)

**Goal:** Contractors see *what exists today* vs *what the homeowner wants*.

**Problem today:** `project_photos` has no type; all photos render in one gallery on share and review.

**Approach:**

1. Add `photo_type` column: `current` (default) | `inspiration`.
2. On upload: default `current`; homeowner can change type per photo (segmented control or badge toggle).
3. Share page + contractor review: two labeled sections, or single gallery with type badges.
4. Empty inspiration section: soft prompt — “Add inspiration photos so contractors see your goal.”

**Schema:**

```sql
ALTER TABLE project_photos
  ADD COLUMN photo_type TEXT NOT NULL DEFAULT 'current'
  CHECK (photo_type IN ('current', 'inspiration'));
```

**API:**

- `POST /api/projects/[id]/photos` — accept optional `photo_type` in formData
- `PATCH /api/projects/[id]/photos/[photoId]` — update `photo_type`

**Files (expected):**

| Area | Files |
| --- | --- |
| Schema | same migration `016` or `017_project_photo_types.sql` |
| Storage/types | `types/index.ts`, `lib/storage/photos.ts`, `lib/phase2/client.ts` |
| Homeowner UI | `components/photos/photo-upload-section.tsx` |
| Contractor/share | `components/share/shared-photo-gallery.tsx` — `groupByType` prop |

**Effort:** ~2 days

**Success:** Contractor review shows “Current space” and “Inspiration” groupings when types are set.

---

### 6.5C — Visual finish tiers + planning bands

**Goal:** Homeowners understand Builder / Elevated / High-end without industry jargon; optional rough budget orientation.

**Problem today:** Phase 4 ships text-only choice buttons. Phase 4 plan deferred “dollar planning bands per tier.”

**Approach:**

1. Replace finish-level choice buttons with **cards**: reference photo, plain-language description, example materials.
2. Show **optional planning band** after selection (homeowner-only on project detail; **not** on contractor estimate editor).

**Tier content (static MVP — no CMS):**

| Tier | Plain description | Example materials | Planning band (national rough) |
| --- | --- | --- | --- |
| Builder grade | Standard, off-the-shelf look | Stock cabinets, laminate counters, basic fixtures | Lower third of typical range for this project type |
| Elevated | Upgraded finishes, some custom | Semi-custom cabinets, quartz, nicer tile | Middle of typical range |
| High-end | Premium, highly custom | Custom cabinetry, stone, designer fixtures | Upper third of typical range |

Bands are **project-type aware** where possible (kitchen vs bath vs exterior paint) using a small static map in `lib/follow-up/finish-tier-bands.ts` — not live market data.

**Copy rules:**

- Always show: “Planning range only — not a quote. Your contractor sets final pricing.”
- Bands appear on homeowner project detail only; contractors see finish level in scope text, not ScopeMate’s band.

**Files (expected):**

| Area | Files |
| --- | --- |
| Content | `lib/follow-up/finish-tier-content.ts`, `assets/finish-tiers/*.jpg` (3–6 stock images) |
| UI | `components/follow-up/finish-tier-choice-cards.tsx` |
| Display | `components/follow-up/finish-tier-planning-note.tsx` on project detail after answer |

**Effort:** ~2–3 days (content + assets)

**Success:** Homeowner selects “Elevated” from a card with a photo; sees a planning band on their project; contractor sees “Finish level: Elevated” in scope only.

---

### 6.5D — Readiness summary for contractors

**Goal:** Surface timeline / readiness prominently so contractors treat the invite as a **qualified lead**, not a cold scope.

**Problem today:** Timeline may appear as one optional follow-up answer buried in scope items.

**Approach:**

1. **Deterministic timeline question** if none exists after scope gen (same pattern as finish level):
   - “When are you hoping to start?”
   - Choices: Within 1 month / 1–3 months / 3–6 months / Just exploring / Not sure
2. **Contractor review header** — compact “Project readiness” row:
   - Target start (from timeline answer)
   - Location
   - Finish level (if answered)
   - Photo count (current / inspiration)
3. **Share page** — same readiness block for link-only contractors.

**No new tables.** Readiness is derived from follow-up answers + photo counts.

**Files (expected):**

| Area | Files |
| --- | --- |
| Timeline inject | `lib/follow-up/timeline.ts` (mirror `finish-level.ts`) |
| Derive | `lib/project/readiness-summary.ts` |
| UI | `components/review/project-readiness-summary.tsx`, use in `contractor-review-workspace.tsx` + share page |

**Effort:** ~1–2 days

**Success:** Contractor opens review and immediately sees “Hoping to start: 1–3 months” without hunting scope items.

---

## Suggested build order

```
6.5D Readiness summary     ← fastest win, sets Phase 7 tone
6.5B Photo types           ← independent, low risk
6.5A Trade quantity        ← highest impact on feedback
6.5C Visual finish tiers   ← completes Phase 4 deferred UX
```

If only one slice before Phase 7 MVP: ship **6.5A + 6.5D**.

---

## Data model summary

### Migration `016_scope_quality.sql` (proposed)

```sql
-- Follow-up: new question type + category
ALTER TABLE follow_up_questions
  DROP CONSTRAINT IF EXISTS follow_up_questions_question_type_check;

ALTER TABLE follow_up_questions
  ADD CONSTRAINT follow_up_questions_question_type_check
  CHECK (question_type IN (
    'text', 'choice', 'dimension_estimate', 'approximate_quantity'
  ));

ALTER TABLE follow_up_questions
  DROP CONSTRAINT IF EXISTS follow_up_questions_category_check;

ALTER TABLE follow_up_questions
  ADD CONSTRAINT follow_up_questions_category_check
  CHECK (category IN (
    'dimensions', 'materials', 'timeline', 'permits',
    'trade_scope', 'quantity', 'other'
  ));

-- Optional: store unit hint for approximate_quantity (cabinet_count, linear_ft, sq_ft)
ALTER TABLE follow_up_questions
  ADD COLUMN quantity_unit TEXT NULL;

-- Photos: current vs inspiration
ALTER TABLE project_photos
  ADD COLUMN photo_type TEXT NOT NULL DEFAULT 'current'
  CHECK (photo_type IN ('current', 'inspiration'));
```

No changes to `projects`, `scope_items`, or estimate tables.

---

## API surface (new / changed)

| Route | Change |
| --- | --- |
| `POST /api/projects/[id]/photos` | Optional `photo_type` |
| `PATCH /api/projects/[id]/photos/[photoId]` | **New** — update type |
| `GET /api/review/[token]` | Include `readiness` object + photos grouped by type |
| `GET /api/share/[token]` | Same readiness + grouped photos |
| Follow-up generate/answer | Support `approximate_quantity` |

---

## Config changes

| Key | Today | 6.5 |
| --- | --- | --- |
| `MAX_FOLLOW_UP_QUESTIONS` | 3 | 5 |

---

## User experience overview

### Homeowner (project detail)

1. Scope generates → finish level + timeline + trade-quantity questions appear (all skippable).
2. Upload photos → tag as Current or Inspiration.
3. Finish level → pick from visual cards → see planning band (homeowner view only).
4. Share when ready — unchanged.

### Contractor (review / share)

1. Header: **Project readiness** (start window, location, finish level, photos).
2. Photos: **Current space** / **Inspiration** sections.
3. Scope: includes quantity answers as normal scope lines (“About how many cabinet doors: 15–30”).
4. Estimate editor: unchanged — contractor still owns all numbers.

---

## Out of scope (Phase 6.5)

- Multi-project priority ranking (“Kitchen #1, Hardscape #2”)
- Benchmark library / top 50–100 project price database
- AI photo analysis or auto-measurement from images
- Requiring quantities or photos to share or invite
- Showing planning bands or AI ranges to contractors in estimate UI
- Homeowner-facing “pick scope items with prices” configurator
- Marketplace / lead routing (Phase 7)

---

## Success criteria (Phase 6.5 complete)

- [ ] Trade-heavy projects get at least one optional quantity follow-up; skip/share still works.
- [ ] Photos can be tagged current vs inspiration; contractors see both groups.
- [ ] Finish level uses visual cards; homeowner sees planning band with disclaimer.
- [ ] Contractor review header shows readiness without opening scope.
- [ ] No regression to Phase 5 estimate flow or Phase 6 contractor dashboard.

---

## Test plan

### 6.5A — Trade quantity
- [ ] “Refinish kitchen cabinets” → cabinet count question appears
- [ ] “Install paver patio” → linear feet question appears
- [ ] Skip quantity → share works; no scope line added
- [ ] Answer → scope item synced; visible on contractor review
- [ ] AI follow-ups do not duplicate quantity topics

### 6.5B — Photo types
- [ ] Upload defaults to `current`
- [ ] Change type to inspiration; persists on refresh
- [ ] Contractor review groups photos correctly
- [ ] Legacy photos (pre-migration) behave as `current`

### 6.5C — Finish tiers
- [ ] Cards render for all three tiers + Not sure
- [ ] Planning band shows after selection on homeowner project only
- [ ] Contractor review shows finish in scope, not band

### 6.5D — Readiness
- [ ] Timeline question injected when missing
- [ ] Readiness header shows start window from answer
- [ ] “Just exploring” displays without implying urgency

---

## Effort summary

| Slice | Estimate | Risk |
| --- | --- | --- |
| 6.5A Trade quantity | 3–4 days | Medium — prompt + dedupe logic |
| 6.5B Photo types | 2 days | Low |
| 6.5C Visual finish tiers | 2–3 days | Low — mostly content/UI |
| 6.5D Readiness summary | 1–2 days | Low |
| **Total** | **~8–11 days** | |

---

## Relationship to Phase 7

Phase 6.5 is the **homeowner-side lead qualification** layer Phase 7 will monetize:

| 6.5 delivers | Phase 7 uses |
| --- | --- |
| Readiness header | Lead score / contractor matching |
| Trade quantities | “Higher intent” signal |
| Inspiration photos | Richer lead card |
| Planning bands (homeowner) | Homeowner expectations vs contractor bid |

Positioning for Phase 7 copy:

> “Homeowner with a defined scope, target start window, and photos — ready for your quote.”

---

## References

- `ROADMAP.md` — Phase 6.5 summary
- `PHASE_2_PLAN.md` — follow-up + photo foundations
- `PHASE_4_PLAN.md` — finish level (6.5C completes deferred tier UX)
- `PROJECT_BRIEF.md` — non-goals (pricing engine)
- `lib/follow-up/finish-level.ts` — pattern for deterministic questions
- `lib/follow-up/dimension-answer.ts` — pattern for optional exact values
- `prompts/follow-up-v1.md` — AI follow-up rules
