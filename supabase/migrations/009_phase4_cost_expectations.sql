CREATE TABLE IF NOT EXISTS project_cost_expectations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  tier        TEXT NOT NULL CHECK (tier IN ('essential', 'elevated', 'signature')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, category)
);

CREATE INDEX IF NOT EXISTS idx_project_cost_expectations_project
  ON project_cost_expectations(project_id);
