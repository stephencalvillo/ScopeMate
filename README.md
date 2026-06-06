# ScopeMate

ScopeMate helps homeowners define construction projects clearly and share contractor-ready scopes.

## Phase 1 *(complete)*

- Homeowner sign-in (Clerk: magic link + Google)
- Create projects
- AI scope generation
- Edit scope items

## Phase 2 *(complete)*

- Photo uploads
- Smart follow-up questions
- Share page with scope, summary, photos

## Phase 3 *(complete)*

- Unified contractor review link (copy or email)
- Project tabs: overview, reviewed scopes, needs attention, activity
- Contractor suggestions with accept / reject / follow-up
- Review scope snapshots and cross-review auto-resolve

## Phase 4 *(complete)*

- Finish-level planning via follow-up question (Builder grade / Elevated / High-end)

## Phase 5 *(in progress)*

- Contractor draft estimates with line items and project total
- Submit proposal; homeowner sees submitted proposals on reviewed scopes

See [`PHASE_5_PLAN.md`](./PHASE_5_PLAN.md) for the full plan.

## Quick start

1. Copy `.env.example` to `.env.local` and fill in your keys.
2. Run SQL migrations in `supabase/migrations/` through `003_phase2_completeness_photos.sql` (and later Phase 3 migrations as needed).
3. Install dependencies:

```bash
npm install
```

4. Start the app:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Documentation

- [PROJECT_BRIEF.md](./PROJECT_BRIEF.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ROADMAP.md](./ROADMAP.md)
- [SECURITY.md](./SECURITY.md)
- [PHASE_3_PUNCH_LIST.md](./PHASE_3_PUNCH_LIST.md)
- [PHASE_4_PLAN.md](./PHASE_4_PLAN.md)

## External services

| Service | Purpose |
|---|---|
| Clerk | Homeowner authentication |
| Supabase | Database |
| OpenAI | AI scope generation |
| Resend | Transactional email |
| Vercel | Hosting (optional) |
