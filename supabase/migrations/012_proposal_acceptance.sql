ALTER TABLE contractor_estimates
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ;

ALTER TABLE contractor_estimates
  DROP CONSTRAINT IF EXISTS contractor_estimates_status_check;

ALTER TABLE contractor_estimates
  ADD CONSTRAINT contractor_estimates_status_check
  CHECK (status IN ('draft', 'submitted', 'accepted', 'declined'));

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS accepted_estimate_id UUID
  REFERENCES contractor_estimates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_accepted_estimate
  ON projects(accepted_estimate_id);

ALTER TABLE contractor_invitations
  DROP CONSTRAINT IF EXISTS contractor_invitations_status_check;

ALTER TABLE contractor_invitations
  ADD CONSTRAINT contractor_invitations_status_check
  CHECK (status IN (
    'pending',
    'in_review',
    'submitted',
    'closed_out',
    'revoked',
    'expired'
  ));
