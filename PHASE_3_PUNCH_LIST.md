# Phase 3 Punch List

Unified share/review link model (one link → `/review/[token]`). Track progress here before Phase 4.

---

## A. Ship blockers (must pass)

| # | Item | Status | Notes |
|---|---|---|---|
| A1 | Create share link → copy or email → same `/review/[token]` URL | [x] | Verified localhost |
| A2 | Contractor identity gate on first open (empty fields for share link) | [x] | Empty fields → Alley identity |
| A3 | Contractor adds suggestions + notes, submits review | [x] | Add suggestion + general note |
| A4 | Homeowner does **not** see suggestions before review submitted | [x] | `listHomeownerSuggestions` filters `status=submitted` |
| A5 | Suggestions appear at top of project page after submit | [x] | Alley's suggestion visible |
| A6 | Accept / Reject / Ask follow-up on each suggestion | [x] | Follow-up sent successfully |
| A7 | Accept add/edit/remove merges into scope correctly | [x] | Joe's accepts show "Suggested by Joe Smho" |
| A8 | Follow-up notifies contractor; response returns to homeowner queue | [~] | Homeowner follow-up works; contractor reply UI missing for add suggestions — **fixed** in `review-scope-list.tsx` |
| A9 | Old `/share/[token]` redirects to `/review/[token]` | [x] | 307 redirect confirmed |
| A10 | Revoked/expired link shows expired notice | [ ] | Regenerated link invalidates placeholder only; Joe's old token still loads |

---

## B. UX polish (in progress)

| # | Item | Status | Notes |
|---|---|---|---|
| B1 | Floating share bar copy matches review link (not read-only) | [x] | `contractor-share-and-activity.tsx` |
| B2 | Fix corrupted middle dot on project header | [x] | `projects/[id]/page.tsx` |
| B3 | Scope attribution shows contractor name, not generic label | [x] | `lib/scope/contractor-attribution.ts` |
| B4 | Suggestions section visible while waiting for contractor review | [x] | Empty/waiting state in inbox |
| B5 | Activity feed hides placeholder share-link identity | [x] | `activity.ts` skips `invitation_sent` for placeholder |
| B6 | Activity labels say "Share link opened" not "viewed" | [x] | `activity.ts` |
| B7 | Share dialog copy describes review experience | [x] | `share-link-dialog-content.tsx` |

---

## C. Email & notifications

| # | Item | Status | Notes |
|---|---|---|---|
| C1 | Share link email sends valid review URL | [ ] | Manual + Resend |
| C2 | Review complete email to homeowner | [ ] | Manual |
| C3 | Follow-up requested → contractor email | [ ] | Manual |
| C4 | Follow-up answered → homeowner email | [ ] | Manual |
| C5 | Invitation expiry = 30 days | [x] | `INVITATION_EXPIRY_DAYS` |

---

## D. Docs & cleanup

| # | Item | Status | Notes |
|---|---|---|---|
| D1 | Update README phase status | [x] | |
| D2 | Update ROADMAP Phase 3 status | [x] | |
| D3 | Update PHASE_3_PLAN access model (unified link) | [ ] | Doc still describes two paths |
| D4 | Remove dead "Send invitation" entry point | [x] | Unified into share dialog |
| D5 | No pricing / estimate UI | [x] | Out of scope |

---

## Manual test script

1. Sign in as homeowner → open project with scope.
2. **Create share link** → copy URL → open in incognito.
3. Complete identity gate → add one add-suggestion + general note → **Submit review**.
4. Homeowner refreshes → **Contractor suggestions** appears at top.
5. **Accept** one suggestion → scope item shows contractor attribution.
6. **Ask follow-up** on another → contractor responds via same link.
7. **Reject** a suggestion → scope unchanged.
8. **Turn off sharing** → old link shows expired/unavailable.
9. **Regenerate link** → old URL dead, new URL works.

---

## Done when

All **A** items pass manual test, **B** polish shipped, **C** emails verified in prod (or Resend dev inbox).
