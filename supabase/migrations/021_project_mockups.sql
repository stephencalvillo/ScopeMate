-- Finished Mock-up studio images saved on a project.
-- Access is server-only via the service role, same as project photos.

CREATE TABLE IF NOT EXISTS project_mockups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name    TEXT NOT NULL,
  mime_type    TEXT NOT NULL,
  file_size    INTEGER NOT NULL,
  prompt       TEXT NOT NULL DEFAULT '',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_mockups_project ON project_mockups(project_id);

ALTER TABLE project_mockups ENABLE ROW LEVEL SECURITY;
