CREATE TABLE IF NOT EXISTS contractor_profiles (
  user_id                  TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name             TEXT NOT NULL DEFAULT '',
  contact_name             TEXT NOT NULL DEFAULT '',
  phone                    TEXT,
  onboarding_completed_at  TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contractor_invitations
  ADD COLUMN IF NOT EXISTS contractor_user_id TEXT
  REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contractor_invitations_contractor_user
  ON contractor_invitations(contractor_user_id);

CREATE INDEX IF NOT EXISTS idx_contractor_invitations_email
  ON contractor_invitations(lower(contractor_email));
