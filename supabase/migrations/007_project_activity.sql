ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS share_enabled_at TIMESTAMPTZ;

ALTER TABLE contractor_invitations
  ADD COLUMN IF NOT EXISTS first_accessed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS project_share_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_share_views_project
  ON project_share_views(project_id, viewed_at DESC);
