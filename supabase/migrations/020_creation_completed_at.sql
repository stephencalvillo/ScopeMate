-- Marks when first-time creation (Next/Finish walkthrough) is done.
-- Existing owned projects are treated as already created.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS creation_completed_at TIMESTAMPTZ;

UPDATE projects
SET creation_completed_at = COALESCE(share_enabled_at, updated_at, created_at)
WHERE homeowner_id IS NOT NULL
  AND creation_completed_at IS NULL;
