# ScopeBuddy — Business Checklist

Operational and legal prerequisites for charging contractors (Contractor Pro), shipping contracts (Phase 6F), and growing the brand.

**Brand:** **ScopeBuddy** (rebranded from ScopeMate — see [§0 Brand & domains](#0-brand--domains-rebrand-from-scopemate)).

**Not legal, tax, or trademark advice.** Use this as a working checklist; confirm entity, tax, and filing decisions with a qualified attorney and CPA.

**Related plans:** [`PHASE_6_PLAN.md`](./PHASE_6_PLAN.md) (Stripe / 6E) · [`PHASE_6F_PLAN.md`](./PHASE_6F_PLAN.md) (contracts / e-sign)

---

## Status key

| Symbol | Meaning |
| --- | --- |
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Done |

Update checkboxes as you go (`[ ]` → `[x]`).

---

## 0. Brand & domains (rebrand from ScopeMate)

| | Task | Notes |
| --- | --- | --- |
| ⬜ | Secure primary domain | **`scopebuddy.com`** — for sale (HugeDomains); buy if price is reasonable. **`scopebuddy.ai`** is taken. |
| ⬜ | Interim production URL | **`myscopemate.ai`** — current Vercel deploy until `scopebuddy.com` is live |
| ⬜ | Update `NEXT_PUBLIC_APP_URL` | Vercel production env when domain changes |
| ⬜ | Rebrand app UI + marketing copy | Code still references ScopeMate in places — separate pass from this doc update |
| ⬜ | Update AI prompts | `prompts/*.md` — assistant identity → ScopeBuddy |
| ⬜ | Clerk / Stripe / Resend sender names | Match ScopeBuddy on cutover |

**Avoid:** `scopemate.app` (unrelated competitor product in same construction-scoping space).

---

## Recommended order of operations

**Do not trademark before the entity exists.** Filing under the wrong owner is painful to fix.

```
1. Form business (Stripe Atlas or state LLC)     ← ScopeBuddy LLC owns the mark
2. Secure domain + start using ScopeBuddy          ← use in commerce
3. USPTO + common-law clearance search             ← before filing fees
4. Publish Terms + Privacy                         ← required for Stripe live
5. File trademark (LLC as applicant)               ← attorney preferred; LegalZoom OK if cleared
6. Stripe live + Contractor Pro                    ← Phase 6E
7. Contracts (Phase 6F)                            ← after ToS / ESIGN copy
```

| Step | Stripe Atlas? | LegalZoom? |
| --- | --- | --- |
| LLC + EIN | ✅ ~$500 one-time | ❌ (use Atlas or state filing) |
| Bank + Stripe payments | ✅ Integrated | ❌ |
| Trademark clearance | ❌ | ⚠️ Basic search only — not legal advice |
| Trademark USPTO filing | ❌ | ✅ Optional filing service (after clearance) |
| Terms / Privacy | ❌ Templates only | ❌ Need real pages |

---

## 1. Entity & money (before Stripe live)

### Option A — Stripe Atlas (recommended bundle)

| | Task | Notes |
| --- | --- | --- |
| ⬜ | [Stripe Atlas](https://stripe.com/atlas) signup | ~**$500** one-time — Delaware **LLC** (bootstrapped SaaS) or C-Corp (only if raising VC) |
| ⬜ | Complete Atlas application | Company name e.g. **ScopeBuddy LLC**; founder info |
| ⬜ | Receive EIN | Atlas files with IRS (1–2 days with SSN; longer without) |
| ⬜ | Open bank via Atlas partner | Mercury, Brex, etc. — business account for payouts |
| ⬜ | Stripe account linked | Ready for test/live Checkout after activation |

**Atlas includes:** incorporation, registered agent (year 1), operating agreement templates (Cooley), 83(b) for C-Corp, Stripe credits/perks.

**Atlas does not include:** trademark, real Terms/Privacy, contract legal review.

**Ongoing:** ~$100/yr registered agent after year 1; Delaware franchise tax (LLC minimal).

### Option B — DIY / other

| | Task | Notes |
| --- | --- | --- |
| ⬜ | Choose business structure | LLC is common for SaaS; confirm with CPA |
| ⬜ | Register entity | State filing or LegalZoom/incorporation service (not needed if using Atlas) |
| ⬜ | Obtain EIN | [IRS EIN](https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online) — free if not using Atlas |
| ⬜ | Open business bank account | Keep subscription revenue separate from personal |
| ⬜ | Link existing Stripe to LLC | Update business profile: LLC name + EIN |

| | Task | Notes |
| --- | --- | --- |
| ⬜ | Align legal name with brand | Prefer **ScopeBuddy LLC** as entity name; DBA only if needed |
| ⬜ | Basic bookkeeping | Spreadsheet or QuickBooks; track Stripe payouts, hosting, tools |

---

## 2. Stripe & billing (Phase 6E)

| | Task | Notes |
| --- | --- | --- |
| ⬜ | Stripe account under **ScopeBuddy LLC** | Same entity as Atlas or §1 |
| ⬜ | Complete Stripe activation | Business profile, EIN, address, industry (Software / SaaS), website URL |
| ⬜ | Connect payout bank account | Business bank from §1 |
| ⬜ | Build in **test mode** first | `sk_test_…` / `pk_test_…`; [test cards](https://docs.stripe.com/testing) |
| ⬜ | Create Product + Price | **Contractor Pro** recurring price; save `price_…` → `STRIPE_PRICE_CONTRACTOR_PRO` |
| ⬜ | Enable Customer Portal | Cancel / update payment method |
| ⬜ | Webhook endpoint | `POST /api/webhooks/stripe`; Stripe CLI for local dev |
| ⬜ | Env vars in Vercel | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_CONTRACTOR_PRO` |
| ⬜ | Publish Terms + Privacy URLs | Required for Checkout — see §3 |
| ⬜ | Define refund policy | Document in Terms (even if “no refunds after period start”) |
| ⬜ | Switch to **live mode** only when §1 + §3 are ready | `sk_live_…` / `pk_live_…` in production |

**Not in MVP:** Stripe Connect (homeowner deposits), Stripe Tax (revisit with CPA when multi-state revenue), annual plans, coupons.

---

## 3. Legal pages (before Stripe live)

| | Task | Notes |
| --- | --- | --- |
| ⬜ | Terms of Service (`/terms`) | Platform rules; limitation of liability; dispute resolution |
| ⬜ | Privacy Policy (`/privacy`) | Required — see data inventory below |
| ⬜ | Contractor / subscription section | Billing, cancellation, Pro features, no legal advice |
| ⬜ | Footer links | Terms, Privacy, contact email on marketing + app shell |
| ⬜ | Attorney review | Startup SaaS template or counsel (~$500–1.5k typical) |

### Privacy Policy — data to disclose

| Data | Source / purpose |
| --- | --- |
| Account (email, name) | Clerk — authentication |
| Project content (description, scope, photos, location) | User-provided; AI-assisted scope |
| Contractor profile (company, phone, service area) | User-provided |
| Estimates & proposals | Contractor-entered pricing |
| Contracts & e-signatures | Typed name, optional drawn signature, IP, user agent, timestamp |
| Payment | Stripe — subscription status, customer ID (not full card numbers) |
| Email | Resend — transactional notifications |
| Hosting & DB | Vercel, Supabase |

Include: retention, deletion requests, subprocessors, no sale of personal data (if true), CCPA-style rights if applicable.

---

## 4. Contracts & e-sign (before Phase 6F launch)

| | Task | Notes |
| --- | --- | --- |
| ⬜ | Contract feature disclaimer in ToS | ScopeBuddy = assembly + record-keeping, not legal advice |
| ⬜ | ESIGN consent copy in product | Per [`PHASE_6F_PLAN.md`](./PHASE_6F_PLAN.md) |
| ⬜ | Contractor “authorize before send” acknowledgment | First send or every send — product + ToS |
| ⬜ | PDF footer disclaimer | On every generated contract |
| ⬜ | Data retention for signed contracts | How long; who can access; backup policy |
| ⬜ | Immutability after sign | Engineering per 6F plan; document in Privacy Policy |

**Out of scope for MVP:** State-specific home-improvement contract packets, lien waivers, notarization, deposit collection.

---

## 5. Trademark & brand

**File after §1 entity + clearance — not before.**

| | Task | Notes |
| --- | --- | --- |
| ⬜ | Clearance search — USPTO | [TESS](https://tmsearch.uspto.gov/) for **ScopeBuddy** and close variants |
| ⬜ | Clearance search — common law | Google, App Store, construction SaaS; watch **Scopeit**, **Smart Scope**, Linux **ScopeBuddy** (gaming — likely OK) |
| ⬜ | Use **ScopeBuddy™** in footer / ToS | ™ = unregistered or pending; **®** only after federal registration |
| ⬜ | File USPTO application | Applicant: **ScopeBuddy LLC**; likely Class **42** (SaaS); consider **35** |
| ⬜ | Choose filing path | **Attorney** (clearance + file, ~$800–1.5k) > **LegalZoom** (filing only, after you clear) > DIY USPTO |
| ⬜ | Monitor conflicting marks | Optional watch service later |

### LegalZoom — when it fits

| Use LegalZoom for | Don’t use LegalZoom for |
| --- | --- |
| USPTO application paperwork after **you** cleared the mark | Clearance opinion (basic report ≠ legal advice) |
| Budget filing when mark is distinctive and low-risk | Office action responses (often extra $; attorney better) |

Registration is **not** required to launch; clearance search **is** recommended before marketing spend and filing fees.

---

## 6. Tax & compliance (ongoing)

| | Task | Notes |
| --- | --- | --- |
| ⬜ | CPA consult | Entity choice, quarterly estimates, deductible expenses |
| ⬜ | Sales tax on SaaS subscriptions | Rules vary by state; enable Stripe Tax or manual process when advised |
| ⬜ | 1099-K / payment reporting | Stripe reports; keep records aligned with tax filings |
| ⬜ | State foreign qualification | If LLC is formed in one state but you operate heavily in another |

---

## 7. Insurance & risk (as you scale)

| | Task | Notes |
| --- | --- | --- |
| ⬜ | General liability | Optional early; some B2B customers ask |
| ⬜ | Cyber / E&O insurance | Consider when storing contracts/signatures at scale or higher MRR |

---

## 8. Product & ops hygiene

| | Task | Notes |
| --- | --- | --- |
| ⬜ | Support contact email | hello@ / support@ on Terms, Privacy, Stripe profile |
| ⬜ | Incident response basics | How you’d handle data breach notification |
| ⬜ | Subprocessor list current | Clerk, Supabase, Stripe, Resend, Vercel, AI provider(s) |
| ⬜ | Copyright notice in footer | `© {year} ScopeBuddy LLC` |

---

## Suggested timeline

```
Now                          Entity + domain              Stripe live                Growth
────────────────────────────────────────────────────────────────────────────────────────────
Interim: myscopemate.ai        Stripe Atlas OR LLC        §3 Terms + Privacy         §5 USPTO filing
Buy scopebuddy.com             §5 Clearance search        §2 Stripe activation       §6 Sales tax
§5 Clearance (before filing)   Start using ScopeBuddy™    6E Contractor Pro          §7 Insurance
Code rebrand (UI, emails)      §5 File trademark          6F contracts
```

---

## Quick reference — env & URLs Stripe expects

| Item | Production target | Interim |
| --- | --- | --- |
| App URL | `https://scopebuddy.com` | `https://myscopemate.ai` |
| Terms URL | `https://scopebuddy.com/terms` | same path on interim host |
| Privacy URL | `https://scopebuddy.com/privacy` | same path on interim host |
| Webhook | `https://scopebuddy.com/api/webhooks/stripe` | update when domain moves |
| Support email | e.g. `support@scopebuddy.com` | — |

---

## Open items (decide and check off)

| | Decision |
| --- | --- |
| ⬜ | Legal entity name: **ScopeBuddy LLC** (confirm) |
| ⬜ | Formation path: **Stripe Atlas** / state DIY / other |
| ⬜ | Buy `scopebuddy.com`: yes / no / max price $_____ |
| ⬜ | Contractor Pro price: $_____ / month |
| ⬜ | Refund policy: ___________________________ |
| ⬜ | Contract data retention: _____ years |
| ⬜ | Trademark filing: **attorney** / LegalZoom / DIY / defer |

---

## References

- [`PHASE_6_PLAN.md`](./PHASE_6_PLAN.md) — Stripe setup steps in §6E
- [`PHASE_6F_PLAN.md`](./PHASE_6F_PLAN.md) — E-sign disclaimers and audit trail
- [`ROADMAP.md`](./ROADMAP.md) — Phase 6 / 6F product order
- [Stripe Atlas](https://stripe.com/atlas)
- [Stripe — Activate your account](https://docs.stripe.com/get-started/account/activate)
- [USPTO — Trademark search](https://tmsearch.uspto.gov/)
