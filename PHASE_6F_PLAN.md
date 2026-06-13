# Phase 6F Plan

## Contracts from Accepted Proposals

**Status:** Proposed — sketch for review before build.

**Depends on:** Phase 5.5 (proposal acceptance), Phase 6A (contractor accounts), Phase 6E (Stripe / Pro gating).

**Replaces / deprioritizes:** Phase 6D proposal template library (see [Pivot note](#pivot-note-replace-6d-with-6f)).

---

## Why 6F exists

ScopeBuddy’s funnel ends at **proposal accepted**. Contractors still need to formalize the job — scope, price, payment, signatures — usually in Word, PDF, or a separate e-sign tool with manual copy-paste from the proposal.

6F closes the loop:

> Homeowner accepts proposal → contractor generates a contract **from that exact scope and estimate** → homeowner acknowledges or signs → both parties have a single source of truth.

This is a stronger Pro anchor than reusable proposal templates because every project is unique, but the **accepted** proposal is already the right starting point.

---

## Product principles

| Principle | What it means |
| --- | --- |
| **Assembly tool, not legal advice** | ScopeBuddy helps contractors **organize** agreement content from project data. Copy and UI make clear contractors (and optionally attorneys) own final terms. |
| **Accepted proposal is the source** | Contract draft pulls from `projects.accepted_estimate_id` + active scope — not a generic template library. |
| **Contractor edits everything material** | Prefill is a draft. Price, deposits, timeline, warranty, and clauses are editable before send. |
| **Homeowner UX stays simple** | Homeowner receives a link, reviews the agreement, acknowledges or signs. No subscription required. |
| **Pro unlocks create + send** | Free tier can still view accepted proposals. Creating and sending a contract requires Contractor Pro (or per-contract credit — see [Pricing](#pricing-shape)). |
| **No deposit collection in MVP** | Payment terms are text fields only. Stripe Connect / escrow is out of scope. |
| **Built-in electronic signature** | ScopeBuddy records signatures in-app (ESIGN consent + typed name + optional drawn signature). No third-party e-sign vendor in MVP. |

---

## Pivot note: replace 6D with 6F

| Original 6D | Revised approach |
| --- | --- |
| Named proposal template library | **Deprioritize** — weak fit for unique remodel scopes |
| Apply template to new review draft | Replace with **“Duplicate from past bid”** (copy line items from a prior submitted estimate on the same account) |
| Pro monetization anchor | Move primary paywall story to **contracts post-acceptance** |
| Saved rates (6C) | **Keep** — still the best speed tool for unique projects |

6D can shrink to a single “duplicate estimate” action on bid history (no template CRUD, no fuzzy scope matching).

---

## User journeys

### Contractor — proposal just accepted

1. Outcome banner on review page updates: **“Proposal accepted — create contract”** (primary CTA).
2. Contractor opens contract builder (authenticated `/contractor` or token review if not signed in — prefer auth for billing gate).
3. Draft prefilled from accepted estimate + scope + profile (company name, contact, phone).
4. Contractor edits: fixed contract price (if proposal was a range), deposit %, payment schedule, start date, warranty, optional custom clauses.
5. Preview → **Send to homeowner** (Pro gate).
6. Homeowner gets email + in-app notification on project detail.
7. Contractor sees status: `sent` → `viewed` → `signed`.

### Contractor — returning later

1. `/contractor` bid history → accepted row → **“Contract”** tab or link.
2. Read-only after homeowner signs; amendment flow deferred.

### Homeowner

1. Project detail shows **“Contract from [Contractor]”** card after send (alongside existing accepted proposal summary).
2. Opens contract view: formatted agreement, scope appendix, line-item schedule (or summary total — contractor chooses display mode in MVP).
3. **Sign flow** (first time per account): ESIGN consent disclosure → review full contract → type full legal name → optional finger/stylus signature on mobile → **“Sign agreement”**.
4. Audit trail logged (user ID, email, typed name, IP, timestamp, contract version); contractor notified.
5. Both download final PDF with signature block.

---

## Contract document structure (MVP sections)

Editable sections marked ✎. Locked-from-source sections marked 🔒.

| # | Section | Source | Notes |
| --- | --- | --- | --- |
| 1 | **Parties** | 🔒 project + profile + homeowner account | Contractor company, license # ✎, homeowner name, project address (city/zip from project; street ✎) |
| 2 | **Project description** | 🔒 `project.title`, `project_type`, `ai_summary` | Short narrative intro |
| 3 | **Scope of work** | 🔒 active `scope_items` at time of contract creation | Snapshot frozen on contract create — later scope edits don’t mutate sent contract |
| 4 | **Price & payment** | 🔒 estimate line items → ✎ contract price | See [Range → fixed price](#range--fixed-price) |
| 5 | **Schedule** | ✎ | Estimated start, duration, substantial completion |
| 6 | **Change orders** | Boilerplate ✎ | Standard “written change order required” language |
| 7 | **Warranty** | ✎ | Default 1-year workmanship placeholder; contractor edits |
| 8 | **Insurance & licensing** | ✎ from profile | Contractor attestation fields |
| 9 | **Termination** | Boilerplate ✎ | |
| 10 | **Signatures** | Electronic signature block | Homeowner: typed name + optional drawn signature + timestamp; contractor: authorize-on-send checkbox recorded in audit trail |

**Appendix A (optional MVP):** Line-item schedule from accepted estimate (description, labor, materials, line total).

---

## Range → fixed price

Accepted proposals may be **ranges** (line-item low/high). Contracts typically need a **single contract price**.

**MVP rule:**

- Contract builder shows accepted range as reference.
- Contractor must enter **Contract price** (required field) before send.
- Default suggestion: upper bound of range, or midpoint — contractor overrides.
- UI copy: “Set the final contract amount. This may differ from the planning range after site verification.”

---

## Delivery slices

Ship as small PRs. Each slice is deployable.

### 6F-A — Contract draft from accepted estimate

**Goal:** Contractor can generate and edit a contract draft; no send yet.

| Item | Notes |
| --- | --- |
| Migration `017` — `project_contracts`, `project_contract_scope_snapshot`, `project_contract_line_items` | See [Data model](#data-model) |
| `POST /api/contractor/contracts` | Create draft from `project.accepted_estimate_id`; snapshot scope + line items |
| `GET/PATCH /api/contractor/contracts/[id]` | Edit editable fields (JSON `terms` blob or column per section) |
| Contract builder UI | Sectioned form + live preview panel |
| Gate: only winning contractor, only when estimate `status = accepted` | |

**Success:** Contractor with accepted bid opens builder → all sections prefilled → edits contract price → saves draft.

---

### 6F-B — PDF export + send to homeowner

**Goal:** Contractor sends a shareable contract; homeowner views without Pro.

| Item | Notes |
| --- | --- |
| PDF generation | Server-side (e.g. `@react-pdf/renderer` or HTML → PDF via puppeteer/playwright on Vercel — pick one in implementation) |
| `POST /api/contractor/contracts/[id]/send` | Status `draft` → `sent`; email homeowner via Resend |
| `GET /api/projects/[id]/contract` | Homeowner auth; read-only contract + PDF URL |
| Homeowner contract card on project detail | |
| Pro gate on send | Free: preview + PDF download for self only (optional); **send** requires Pro |

**Success:** Pro contractor sends contract → homeowner receives email → opens link → sees agreement.

---

### 6F-C — Electronic signature (in-app)

**Goal:** Homeowner signs the contract inside ScopeBuddy — no DocuSign or third-party e-sign vendor.

Under US **ESIGN Act** and state **UETA** laws, an electronic signature is valid when intent, consent, record association, and retention are demonstrated. ScopeBuddy is the record system; it does not provide legal advice or state-specific compliance.

| Item | Notes |
| --- | --- |
| ESIGN consent screen | One-time per user (or per sign): consent to electronic records and signatures |
| `POST /api/projects/[id]/contract/sign` | Typed full legal name (required), intent checkbox, optional `signature_image` (base64 PNG from canvas) |
| Audit trail table `project_contract_signatures` | `contract_id`, `signer_role`, `user_id`, `typed_name`, `email`, `ip_address`, `user_agent`, `signature_image_path`, `contract_version`, `signed_at` |
| Status `sent` → `viewed` (on open) → `signed` | |
| Name validation | Typed name must match account name or user confirms “signing as authorized representative” |
| Contractor email | “Homeowner signed contract” |
| PDF re-generated | Signature block: typed name, optional image, date, “Signed electronically via ScopeBuddy” |
| Immutability after sign | Draft edits locked; void + reissue only before homeowner signs |

**Sign UI (homeowner):**

1. Read ESIGN disclosure → **Continue**
2. Scroll/review contract (require scroll-to-bottom or “I have read” checkbox)
3. Type full legal name
4. Optional: draw signature (touch/mouse on canvas)
5. Checkbox: “I agree to the terms of this agreement”
6. **Sign agreement** (disabled until name + checkbox complete)

**Success:** Homeowner signs → contractor sees **Signed** status → both download final PDF with audit-backed signature block.

---

### Third-party e-sign *(out of scope — optional later)*

DocuSign / Dropbox Sign is **not required** for MVP. Revisit only if contractors explicitly request a third-party certificate of completion or a lender/HOA mandates it. Would ship as a separate paid add-on if envelope costs justify it.

---

## Pricing shape

| Model | Pros | Cons |
| --- | --- | --- |
| **Pro subscription includes N contracts/mo** (e.g. 5) | Predictable revenue; simple gate | Heavy contractors hit limit |
| **Pro unlimited contracts** | Simple story | May underprice power users |
| **Per-contract fee** ($5–15) | Fair for occasional users | Extra Stripe product complexity |
| **Hybrid** — Pro includes 3/mo, overage per contract | Balanced | More UX |

**Recommendation for launch:** Pro subscription **includes unlimited contract send + in-app signature** (MVP). No per-envelope vendor cost since signing is built in-house.

Rates + duplicate-from-bid remain Pro speed features (6C + slim 6D).

---

## Legal & disclaimer positioning

ScopeBuddy must **not** present as a law firm or state-specific compliance product.

**Global disclaimer (contract builder + homeowner view + PDF footer):**

> This document was prepared using ScopeBuddy as a formatting and assembly tool. It is not legal advice. The contractor is solely responsible for the accuracy, completeness, and enforceability of this agreement. Consult a qualified attorney licensed in your jurisdiction before signing.

**Contractor acknowledgment (required before first send):**

> I understand ScopeBuddy does not provide legal advice. I am responsible for reviewing and approving all contract terms before sending to my client.

**ESIGN consent (first sign per user, 6F-C):**

> By signing electronically, you agree to use electronic records and signatures for this transaction under the ESIGN Act and applicable state law. You may request a paper copy from the contractor.

**Homeowner sign step (6F-C):**

> I have read this agreement and agree to its terms. I understand my typed name and/or drawn signature constitute my electronic signature.

**ScopeBuddy liability framing (builder + PDF footer):**

> ScopeBuddy records this electronic signature and provides document assembly only. It is not legal advice. The contractor is responsible for the enforceability of this agreement in your jurisdiction.

**Boilerplate clauses:** Use short, generic remodeling-friendly language (change orders, dispute resolution, force majeure). All clauses editable/removable. No state-specific lien waiver packets in MVP.

**Insurance / license fields:** Optional text inputs on contractor profile + contract; no verification.

---

## Data model

### `project_contracts`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `project_id` | UUID FK | |
| `estimate_id` | UUID FK | Must match `projects.accepted_estimate_id` |
| `contractor_user_id` | UUID FK | Winning contractor |
| `status` | TEXT | `draft`, `sent`, `viewed`, `signed`, `void` |
| `contract_price` | NUMERIC | Required before send |
| `currency` | TEXT | Default `USD` |
| `terms` | JSONB | Editable sections: schedule, payment_schedule, deposit_percent, warranty, custom_clauses, insurance_text, etc. |
| `homeowner_snapshot` | JSONB | Name, email at send time |
| `contractor_snapshot` | JSONB | Company, contact, phone, license at send time |
| `sent_at` | TIMESTAMPTZ | |
| `viewed_at` | TIMESTAMPTZ | |
| `signed_at` | TIMESTAMPTZ | Set when homeowner completes sign flow |
| `pdf_storage_path` | TEXT | Latest PDF in Supabase storage |
| `contract_version` | INT | Increment on send; sign event pins to this version |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

One **active** contract per accepted estimate in MVP (no versioning until amendments).

### `project_contract_scope_items` *(snapshot)*

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `contract_id` | UUID FK | |
| `category` | TEXT | |
| `text` | TEXT | |
| `sort_order` | INT | |

### `project_contract_line_items` *(snapshot)*

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `contract_id` | UUID FK | |
| `description` | TEXT | |
| `labor_cost` | NUMERIC | Snapshot values at create |
| `material_cost` | NUMERIC | |
| `total` | NUMERIC | |
| `sort_order` | INT | |

### `project_contract_signatures` *(audit trail)*

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `contract_id` | UUID FK | |
| `signer_role` | TEXT | `contractor`, `homeowner` |
| `user_id` | UUID FK | Clerk user |
| `typed_name` | TEXT | Required for homeowner |
| `email` | TEXT | Snapshot at sign time |
| `ip_address` | TEXT | From request |
| `user_agent` | TEXT | From request |
| `signature_image_path` | TEXT | Optional drawn signature in storage |
| `contract_version` | INT | Matches `project_contracts.contract_version` at sign |
| `esign_consent_at` | TIMESTAMPTZ | Homeowner only; when ESIGN disclosure accepted |
| `signed_at` | TIMESTAMPTZ | |

Contractor **authorize on send** creates a `contractor` row when `POST .../send` succeeds.

---

## API surface

| Route | Slice | Purpose |
| --- | --- | --- |
| `POST /api/contractor/contracts` | 6F-A | Create draft from accepted estimate |
| `GET /api/contractor/contracts/[id]` | 6F-A | Contractor read |
| `PATCH /api/contractor/contracts/[id]` | 6F-A | Edit terms / contract price |
| `GET /api/contractor/contracts?projectId=` | 6F-A | List for bid / project |
| `POST /api/contractor/contracts/[id]/preview-pdf` | 6F-B | Generate preview PDF |
| `POST /api/contractor/contracts/[id]/send` | 6F-B | Pro gate; email homeowner |
| `GET /api/projects/[id]/contract` | 6F-B | Homeowner read |
| `POST /api/projects/[id]/contract/sign` | 6F-C | Homeowner electronic signature |
| `GET /api/contractor/contracts/[id]/pdf` | 6F-B | Signed download URL |

---

## UI touchpoints

| Location | Change |
| --- | --- |
| `ContractorProposalOutcomeBanner` | Add **Create contract** CTA when `estimate.status === accepted` |
| `/contractor` bid history (6B) | Accepted rows → contract status badge + link |
| `/contractor/contracts/[id]` or modal from review | Contract builder (section form + preview) |
| Project detail (homeowner) | Contract card after send; ESIGN + sign flow |
| `AcceptedProposalSummary` | Optional link: “View contract” when sent |
| `/contractor/billing` (6E) | Pro value prop copy mentions contracts |

---

## Revised Phase 6 order

| Slice | Focus | Priority |
| --- | --- | --- |
| **6A** | Contractor accounts & dashboard | Done |
| **6B** | Bid history | Next |
| **6C** | Saved rates | High |
| **6E** | Stripe Pro subscription | High — gate for contracts |
| **6F-A/B/C** | Contracts (draft → send → in-app sign) | **Primary Pro differentiator** |
| **6D′** | Duplicate from past bid (not template library) | Low — nice-to-have |

6.5 (scope quality) can run in parallel; better scope → better contracts.

---

## Out of scope (6F MVP)

- Change order workflow after sign
- Contract amendments / versioning
- Third-party e-sign (DocuSign, etc.)
- Deposit / milestone payment collection
- Lien waiver packets by state
- Homeowner-initiated contract requests
- Multi-party contracts (subcontractors)
- AI-generated legal clauses
- Automatic sync if scope changes after contract sent

---

## Open decisions (confirm before 6F-A)

| # | Question | Lean |
| --- | --- | --- |
| 1 | One contract per project ever, or allow void + reissue? | Allow **void + new draft** before homeowner signs only |
| 2 | Token contractors without Pro account — can they create contract? | **Require signed-in Pro**; CTA to subscribe from outcome banner |
| 3 | Show full line-item $ on homeowner contract or summary only? | Contractor toggle: **Summary** (default) vs **Detailed schedule** |
| 4 | PDF tech on Vercel | Evaluate `@react-pdf/renderer` first (no headless browser) |
| 5 | Store PDFs in Supabase storage bucket `contracts` | Yes; RLS by project membership |
| 6 | Contractor-client projects (`creator_role = contractor`) | Same flow; “client” replaces homeowner in copy |

---

## Success criteria

- Winning contractor can create a contract draft from an accepted proposal in under 5 minutes.
- Contract snapshots scope and estimate at creation time; later project edits don’t change a sent contract.
- Pro contractor can send contract; homeowner can view and sign electronically without paying.
- Both parties can download a PDF with disclaimer footer and signature audit record.
- Free contractor sees upgrade CTA on send; can still complete token reviews and proposals.

---

## Test plan

### 6F-A — Draft
- [ ] Only accepted estimate’s contractor can create contract
- [ ] Scope + line items snapshot correctly
- [ ] Contract price required; range shown as reference
- [ ] Edit terms persist; preview updates

### 6F-B — Send
- [ ] Non-Pro blocked on send with upgrade CTA
- [ ] Pro send → homeowner email + project card
- [ ] PDF generates with all sections + disclaimer

### 6F-C — Sign
- [ ] ESIGN consent shown before first sign
- [ ] Homeowner sign records typed name, optional drawn signature, IP, timestamp
- [ ] Contract locked after sign
- [ ] Contractor notification email
- [ ] Final PDF includes signature block + audit metadata

---

## References

- `PHASE_6_PLAN.md` — Pro tier, billing, deprioritized 6D
- `PHASE_5_PLAN.md` — Estimates and proposal acceptance
- `lib/estimates/proposal-decision.ts` — Accepted estimate helpers
- `components/review/contractor-proposal-outcome-banner.tsx` — Entry CTA
- `components/project/accepted-proposal-summary.tsx` — Homeowner post-accept UI
