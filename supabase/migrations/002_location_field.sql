-- Add flexible location field; city/zip remain for parsed values and AI context

ALTER TABLE projects ADD COLUMN IF NOT EXISTS location TEXT;

UPDATE projects
SET location = TRIM(
  city || CASE WHEN zip IS NOT NULL AND zip <> '' THEN ', ' || zip ELSE '' END
)
WHERE location IS NULL;

ALTER TABLE projects ALTER COLUMN zip DROP NOT NULL;
