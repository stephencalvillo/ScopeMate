-- Allow anonymous guest projects before account creation
ALTER TABLE projects
  ALTER COLUMN homeowner_id DROP NOT NULL;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS guest_access_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_projects_guest_access_token
  ON projects(guest_access_token)
  WHERE guest_access_token IS NOT NULL;
