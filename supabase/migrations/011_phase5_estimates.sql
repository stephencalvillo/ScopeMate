CREATE TABLE IF NOT EXISTS contractor_estimates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  review_id      UUID NOT NULL UNIQUE REFERENCES contractor_reviews(id) ON DELETE CASCADE,
  invitation_id  UUID NOT NULL REFERENCES contractor_invitations(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'submitted')),
  total          NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  submitted_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contractor_estimates_project
  ON contractor_estimates(project_id);

CREATE INDEX IF NOT EXISTS idx_contractor_estimates_invitation
  ON contractor_estimates(invitation_id);

CREATE TABLE IF NOT EXISTS estimate_line_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id    UUID NOT NULL REFERENCES contractor_estimates(id) ON DELETE CASCADE,
  scope_item_id  UUID REFERENCES scope_items(id) ON DELETE SET NULL,
  description    TEXT NOT NULL,
  labor_cost     NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (labor_cost >= 0),
  material_cost  NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (material_cost >= 0),
  total          NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_estimate_line_items_estimate
  ON estimate_line_items(estimate_id);
