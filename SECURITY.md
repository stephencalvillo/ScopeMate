# ScopeMate  -  Security

## Authentication

- Use **Clerk** for homeowner authentication.
- Homeowners can only access their own projects.
- Contractors can only access invited projects. *(Phase 3)*
- Implement role-based access (`homeowner`, `contractor`, `admin`).

## Database Security

- Use **Supabase Row Level Security (RLS)** on all tables.
- Never trust client-side permissions.
- Validate ownership server-side in every API route and Server Action.

## Share Links

- Use secure random tokens (cryptographically random, URL-safe).
- **Good:** `/share/H7xK9qLm4T`
- **Bad:** `/project/123`

**Allow:**

- Disable link
- Regenerate link
- Expire link

## API Security

- All AI requests are server-side only.
- Never expose:
  - OpenAI keys
  - Supabase service role keys
- Use:
  - Input validation (Zod)
  - Rate limiting
  - Request logging

## AI Safety

AI must:

- Separate facts from assumptions
- Mark uncertain items
- Preserve user edits
- Avoid hallucinating dimensions
- Avoid hallucinating permit requirements

Use **"Contractor must verify"** when uncertain.

## Privacy

**Avoid collecting:**

- Full addresses
- Financial information
- Sensitive personal information

**Prefer:**

- City
- ZIP code

**Allow users to:**

- Delete projects
- Delete photos *(Phase 2)*
- Delete account

## Photo Handling *(Phase 2)*

Photos may be processed by AI in future phases.

Display notice when AI analyzes photos:

> "AI-generated measurements and observations are estimates only and must be verified by a contractor."

**Quote improvement items are optional.** Do not use missing photos or follow-up answers to restrict share links or imply a project is incomplete. No completeness or quote-readiness scores in the MVP.

## Disclaimers

ScopeMate is a planning tool. It does not provide:

- Engineering advice
- Architectural advice
- Permit advice
- Final construction pricing

Contractors remain responsible for final scope verification and pricing.
