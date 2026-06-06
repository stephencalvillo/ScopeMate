# Phase 4 Plan

## Finish-Level Planning (via Follow-Ups)

**Status:** Complete — finish level folded into follow-up questions.

**Depends on:** Phase 3 complete.

---

## Why Phase 4 exists

Homeowners and contractors need a shared vocabulary for budget conversations **without** ScopeMate becoming a pricing engine. Phase 4 adds **project-wide finish planning**, not quotes.

> Homeowner picks a rough finish level → answer syncs into scope → contractor still owns final pricing.

---

## Product principles

| Principle              | What it means                                                |
| ---------------------- | ------------------------------------------------------------ |
| Ranges, not prices     | Show planning tiers — never line-item quotes                 |
| Tier language          | **Builder grade**, **Elevated**, **High-end**                 |
| Optional, not blocking | Finish level helps planning; sharing scope never requires it |
| Contractor validates   | Copy makes clear contractors verify all numbers on site      |
| One UI for context     | Finish level lives in follow-up questions, not a second panel |

---

## Shipped

| Item | Status |
| ---- | ------ |
| Materials follow-up: “What finish level are you targeting?” | Done |
| Choices: Builder grade / Elevated / High-end / Not sure | Done |
| Answer syncs to scope items (existing follow-up flow) | Done |
| Retired separate cost expectations panel + API | Done |

---

## Next up

| Step | Task |
| ---- | ---- |
| 1 | Optional dollar planning bands per tier (still not line-item quotes) |
| 2 | Phase 4 test plan + mark complete in ROADMAP |

---

## Out of scope (Phase 4)

- Per-trade tier pickers (retired)
- Line-item estimates (Phase 5)
- Contractor-editable rates (Phase 6)
- Market pricing APIs / live material costs

---

## Success criteria

- Homeowner can set finish level via follow-up without blocking share or review.
- Contractors see the answer in scope context, not a separate cost grid.
- No exact pricing or estimate line items anywhere in Phase 4 UI.

---

## References

- `ROADMAP.md` — Phase 4 summary
- `lib/follow-up/finish-level.ts` — deterministic materials question
- `prompts/follow-up-v1.md` — AI follow-ups (materials excluded; finish level injected)
