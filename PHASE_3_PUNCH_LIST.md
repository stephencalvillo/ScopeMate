# Phase 3 Punch List

Unified share/review link model (one link → `/review/[token]`). Project page uses tabs: **Overview**, **Reviewed scopes**, **Needs attention**, **Activity**.

---

## A. Ship blockers (must pass)

| # | Item | Status | Notes |
|---|---|---|---|
| A1 | Create share link → copy or email → same `/review/[token]` URL | [x] | Verified localhost |
| A2 | Contractor identity gate on first open (empty fields for share link) | [x] | Empty fields → identity gate |
| A3 | Contractor adds suggestions + notes, submits review | [x] | Add suggestion + general note |
| A4 | Homeowner does **not** see suggestions before review submitted | [x] | `listHomeownerSuggestions` filters submitted reviews |
| A5 | Suggestions appear after submit | [x] | **Needs attention** tab + email links |
| A6 | Accept / Reject / Ask follow-up on each suggestion | [x] | Inline on review detail + Needs attention tab |
| A7 | Accept add/edit/remove merges into scope correctly | [x] | Canonical scope updates project overview |
| A8 | Follow-up notifies contractor; response returns to homeowner queue | [x] | Contractor reply UI on review page |
| A9 | Old `/share/[token]` redirects to `/review/[token]` | [x] | 307 redirect confirmed |
| A10 | Regenerate/disable share invalidates share-link review URLs | [x] | Revokes by old token; personal email invites unaffected |
| A11 | Accepting a suggestion auto-resolves matching open suggestions | [x] | Same scope item or duplicate add text |

---

## B. UX polish

| # | Item | Status | Notes |
|---|---|---|---|
| B1 | Floating share bar copy matches review link | [x] | |
| B2 | Fix corrupted middle dot on project header | [x] | |
| B3 | Scope attribution shows contractor name | [x] | |
| B4 | Project page tabs (overview, reviewed scopes, needs attention, activity) | [x] | |
| B5 | Reviewed scope cards + detail use sentence-case headlines | [x] | e.g. "Maria Lopez submitted a review" |
| B6 | Needs attention card IA (headline → suggestion → actions) | [x] | No all-caps labels |
| B7 | Activity feed in dedicated tab | [x] | |
| B8 | Photos under project summary on overview | [x] | |

---

## C. Email & notifications

| # | Item | Status | Notes |
|---|---|---|---|
| C1 | Share link email sends valid review URL | [x] | Code + Resend error handling; verify in prod/dev inbox |
| C2 | Review complete email to homeowner | [x] | Links to `?tab=needs-attention` |
| C3 | Follow-up requested → contractor email | [x] | |
| C4 | Follow-up answered → homeowner email | [x] | Links to `?tab=needs-attention` |
| C5 | Invitation expiry = 30 days | [x] | `INVITATION_EXPIRY_DAYS` |

**Manual email verification:** Set `RESEND_API_KEY` + `EMAIL_FROM` in `.env.local`. Dev sandbox (`onboarding@resend.dev`) only delivers to your Resend account email. Prod requires a verified domain.

---

## D. Docs & cleanup

| # | Item | Status | Notes |
|---|---|---|---|
| D1 | Update README phase status | [x] | |
| D2 | Update ROADMAP Phase 3 status | [x] | Phase 4 marked in progress |
| D3 | Remove `SuggestionsInbox` | [x] | Replaced by Needs attention tab |
| D4 | Snapshot backfill for pre-3.5b reviews | [ ] | Optional |

---

## Manual test script

1. Sign in as homeowner → open project with scope.
2. **Project overview** → create share link → copy URL → open in incognito.
3. Complete identity gate → add suggestions + general note → **Submit review**.
4. Homeowner → **Needs attention** tab → accept / follow-up / reject.
5. Accept suggestion → scope updates on **Overview**; duplicate contractor suggestions auto-resolve.
6. **Reviewed scopes** → open review → compare As submitted / Current scope.
7. **Regenerate link** → old share URL shows expired; personal email invite still works.
8. **Turn off sharing** → share-link URLs stop working.
9. Trigger emails (share, review complete, follow-up) and confirm links land on the right tab.

---

## Done when

Phase 3 is **complete**. Remaining optional item: snapshot backfill (D4).

Phase 4 has started — see [`PHASE_4_PLAN.md`](./PHASE_4_PLAN.md).
