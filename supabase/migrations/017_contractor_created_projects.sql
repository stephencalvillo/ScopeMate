-- Track whether a guest project was started by a homeowner or contractor.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS creator_role TEXT NOT NULL DEFAULT 'homeowner';

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_creator_role_check'
  ) THEN
    ALTER TABLE projects
      ADD CONSTRAINT projects_creator_role_check
      CHECK (creator_role IN ('homeowner', 'contractor'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_created_by_user
  ON projects(created_by_user_id)
  WHERE created_by_user_id IS NOT NULL;
