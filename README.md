# ScopeMate

ScopeMate helps homeowners define construction projects clearly and share contractor-ready scopes.

## Phase 1 (current)

- Homeowner sign-in (Clerk: magic link + Google)
- Create projects
- AI scope generation
- Edit scope items
- Secure share links for contractors

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
