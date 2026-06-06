ALTER TABLE scope_items
  ADD COLUMN IF NOT EXISTS follow_up_question_id UUID
  REFERENCES follow_up_questions(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_scope_items_follow_up_question
  ON scope_items(follow_up_question_id)
  WHERE follow_up_question_id IS NOT NULL;
