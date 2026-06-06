CREATE TABLE IF NOT EXISTS contractor_invitations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invited_by         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contractor_name    TEXT NOT NULL,
  contractor_email   TEXT NOT NULL,
  contractor_company TEXT,
  invitation_token   TEXT NOT NULL UNIQUE,
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'in_review', 'submitted', 'revoked', 'expired')),
  accepted_at        TIMESTAMPTZ,
  last_accessed_at   TIMESTAMPTZ,
  expires_at         TIMESTAMPTZ NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contractor_invitations_project
  ON contractor_invitations(project_id);

CREATE INDEX IF NOT EXISTS idx_contractor_invitations_token
  ON contractor_invitations(invitation_token);

CREATE TABLE IF NOT EXISTS contractor_reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invitation_id  UUID NOT NULL UNIQUE REFERENCES contractor_invitations(id) ON DELETE CASCADE,
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'in_progress'
                 CHECK (status IN ('in_progress', 'submitted')),
  submitted_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scope_suggestions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id             UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invitation_id          UUID NOT NULL REFERENCES contractor_invitations(id) ON DELETE CASCADE,
  target_scope_item_id   UUID REFERENCES scope_items(id) ON DELETE SET NULL,
  suggestion_type        TEXT NOT NULL
                         CHECK (suggestion_type IN ('add', 'edit', 'remove', 'note')),
  category               TEXT,
  suggested_text         TEXT,
  contractor_note        TEXT,
  status                 TEXT NOT NULL DEFAULT 'draft'
                         CHECK (status IN (
                           'draft',
                           'pending',
                           'follow_up_requested',
                           'accepted',
                           'rejected',
                           'withdrawn'
                         )),
  homeowner_rejection_reason TEXT,
  resolved_at            TIMESTAMPTZ,
  resolved_by            TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scope_suggestions_project_status
  ON scope_suggestions(project_id, status);

CREATE INDEX IF NOT EXISTS idx_scope_suggestions_invitation
  ON scope_suggestions(invitation_id);

CREATE TABLE IF NOT EXISTS suggestion_follow_ups (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id  UUID NOT NULL REFERENCES scope_suggestions(id) ON DELETE CASCADE,
  author_role    TEXT NOT NULL CHECK (author_role IN ('homeowner', 'contractor')),
  message        TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suggestion_follow_ups_suggestion
  ON suggestion_follow_ups(suggestion_id);

ALTER TABLE scope_items
  ADD COLUMN IF NOT EXISTS suggestion_id UUID
  REFERENCES scope_suggestions(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_scope_items_suggestion
  ON scope_items(suggestion_id)
  WHERE suggestion_id IS NOT NULL;
