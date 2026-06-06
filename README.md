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

## Phase 3 *(in progress)*

- Unified contractor review link (copy or email)
- Contractor suggestions + homeowner accept/reject/follow-up
- Activity tracking

See [`PHASE_3_PUNCH_LIST.md`](./PHASE_3_PUNCH_LIST.md) for ship checklist.

## Quick start

1. Copy `.env.example` to `.env.local` and fill in your keys.
2. Run the SQL migration in `supabase/migrations/001_phase1_initial.sql`.
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
- [PHASE_2_PLAN.md](./PHASE_2_PLAN.md) — Quote improvement checklist + photos (no completeness score)

## External services

| Service | Purpose |
|---|---|
| Clerk | Homeowner authentication |
| Supabase | Database |
| OpenAI | AI scope generation |
| Vercel | Hosting (optional) |
