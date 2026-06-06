-- Remove completeness score (replaced by checklist-style quote improvement)
-- Run this if an earlier migration added completeness_score to projects.

ALTER TABLE projects
  DROP COLUMN IF EXISTS completeness_score,
  DROP COLUMN IF EXISTS completeness_updated_at;

ALTER TABLE follow_up_questions
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other';

-- Add check constraint only if column was just added without it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'follow_up_questions_category_check'
  ) THEN
    ALTER TABLE follow_up_questions
      ADD CONSTRAINT follow_up_questions_category_check
      CHECK (category IN ('dimensions', 'materials', 'timeline', 'permits', 'trade_scope', 'other'));
  END IF;
END $$;
